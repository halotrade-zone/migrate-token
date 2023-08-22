const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const { expect } = chai;
const { ethers } = require('hardhat');
const { constants } = require('@openzeppelin/test-helpers');

describe('Migrate Token', () => {
  const contracts = {};
  const tokens = {};
  let owner; let user1; let user2;

  before('Deploy contracts and mint some tokens', async () => {
      [owner, user1, user2] = await ethers.getSigners();

      const TOKEN = await ethers.getContractFactory('SimpleERC20');
      const MIGRATE_CONTRACT = await ethers.getContractFactory('MigrateToken');

      // deploy source and target token
      contracts.sourceToken = await TOKEN.deploy();
      contracts.targetToken = await TOKEN.deploy();

      contracts.sourceToken.address = await contracts.sourceToken.getAddress();
      contracts.targetToken.address = await contracts.targetToken.getAddress();

      // deploy migrate contract
      contracts.migrateToken = await MIGRATE_CONTRACT.deploy(contracts.sourceToken.address, contracts.targetToken.address);

      contracts.migrateToken.address = await contracts.migrateToken.getAddress();

      // transfer some target tokens to user1
      await contracts.targetToken.transfer(user1.address, BigInt("1000"));

      // transfer some source tokens to user1
      await contracts.sourceToken.transfer(user1.address, BigInt("10000000"));

      contracts.owner = {
        sourceToken: contracts.sourceToken.connect(owner),
        targetToken: contracts.targetToken.connect(owner),
        migrateToken: contracts.migrateToken.connect(owner),
      };
      contracts.user1 = {
        sourceToken: contracts.sourceToken.connect(user1),
        targetToken: contracts.targetToken.connect(user1),
        migrateToken: contracts.migrateToken.connect(user1),
      };
      contracts.user2 = {
        sourceToken: contracts.sourceToken.connect(user2),
        targetToken: contracts.targetToken.connect(user2),
        migrateToken: contracts.migrateToken.connect(user2),
      };
  });

  it('The successfull deployment', async () => {
    expect(await contracts.sourceToken.getAddress()).to.be.a('string');
    expect(await contracts.targetToken.getAddress()).to.be.a('string');
    expect(await contracts.migrateToken.getAddress()).to.be.a('string');

    // query the balance of user1
    const user1Balance = await contracts.sourceToken.balanceOf(user1.address);
    expect(user1Balance).to.equal(BigInt("10000000"));

    // query the balance of user2
    const user2Balance = await contracts.sourceToken.balanceOf(user2.address);
    expect(user2Balance).to.equal(BigInt("0"));

    // the source token and target token of migrate contract must be correct
    const sourceToken = await contracts.migrateToken.sourceToken();
    const targetToken = await contracts.migrateToken.targetToken();

    expect(sourceToken).to.equal(contracts.sourceToken.address);
    expect(targetToken).to.equal(contracts.targetToken.address);
  });

  describe('Deposit source token', () => {
      it('Cannot deposit zero token', async () => {
        // owner deposit zero token to migrate contract
        await expect(contracts.owner.migrateToken.deposit(BigInt("0"))).eventually.be.rejectedWith('Invalid amount');
      });

      it('Anyone can deposit target token to migrate contract', async () => {
        // owner deposit 1000 token to migrate contract
        await contracts.owner.targetToken.approve(contracts.migrateToken.address, BigInt("1000"));
        await contracts.owner.migrateToken.deposit(BigInt("1000"));

        // the balance of migrate contract must be 1000
        await expect(contracts.targetToken.balanceOf(contracts.migrateToken.address)).eventually.eq(BigInt("1000"));

        // user1 deposit 1000 token to migrate contract
        await contracts.user1.targetToken.approve(contracts.migrateToken.address, BigInt("1000"));
        await contracts.user1.migrateToken.deposit(BigInt("1000"));

        // the remaining balance of user1 must be zero
        await expect(contracts.targetToken.balanceOf(user1.address)).eventually.eq(BigInt("0"));

        // the balance of migrate contract must be 1000 + 1000 = 2000
        await expect(contracts.targetToken.balanceOf(contracts.migrateToken.address)).eventually.eq(BigInt("2000"));
      });

      it('Deposit by transfer target token to migrate contract directly', async () => {
        // owner transfer 1000 token to migrate contract
        await contracts.owner.targetToken.transfer(contracts.migrateToken.address, BigInt("1000"));

        // the balance of migrate contract must be 2000 + 1000 = 3000
        await expect(contracts.targetToken.balanceOf(contracts.migrateToken.address)).eventually.eq(BigInt("3000"));
      });
  });

  describe('Withdraw tokens', () => {
    it('cannot withdraw because not owner', async () => {
      // user1 withdraw target token
      await expect(contracts.user1.migrateToken.withdraw(contracts.targetToken.address)).eventually.be.rejectedWith('Ownable: caller is not the owner');
    });

    it('cannot withdraw because token address is zero', async () => {
      // owner withdraw token with address is zero
      await expect(contracts.owner.migrateToken.withdraw(constants.ZERO_ADDRESS)).eventually.be.rejectedWith('Invalid token address');
    });

    it('owner can withdraw successfully', async () => {
      // query the balance of owner before withdraw
      const ownerBalance = await contracts.targetToken.balanceOf(owner.address);

      // owner withdraw target token
      await contracts.owner.migrateToken.withdraw(contracts.targetToken.address);

      // query the balance of owner after withdraw
      const ownerBalanceAfter = await contracts.targetToken.balanceOf(owner.address);

      // the balance of owner must be ownerBalance + 3000
      expect(ownerBalanceAfter).to.equal(ownerBalance + BigInt("3000"));

      // the balance of migrate contract must be zero
      await expect(contracts.targetToken.balanceOf(contracts.migrateToken.address)).eventually.eq(BigInt("0"));
    });

    it('cannot withdraw because balance is zero', async () => {
      // owner withdraw target token
      await expect(contracts.owner.migrateToken.withdraw(contracts.targetToken.address)).eventually.be.rejectedWith('Invalid balance');
    });
  });

  describe('Convert source tokens to target tokens', () => {
    it('cannot convert because balance of target token is zero', async () => {
      // user1 convert 1000 source token to target token
      await expect(contracts.user1.migrateToken.convert(BigInt("1000"))).eventually.be.rejectedWith('ERC20: insufficient allowance');
    });

    it('cannot convert because balance of source token is zero', async () => {
      // owner approve 1000 target token to migrate contract
      await contracts.owner.targetToken.approve(contracts.migrateToken.address, BigInt("1000"));

      // owner deposit 1000 target token to migrate contract
      await contracts.owner.migrateToken.deposit(BigInt("1000"));

      // user2 approve 100 source token to migrate contract
      await contracts.user2.sourceToken.approve(contracts.migrateToken.address, BigInt("100"));

      // user2 convert 100 source token to target token
      await expect(contracts.user2.migrateToken.convert(BigInt("100"))).eventually.be.rejectedWith('ERC20: transfer amount exceeds balance');
    });

    it('cannot convert because convert amount is zero', async () => {
      // user1 convert 0 source token to target token
      await expect(contracts.user1.migrateToken.convert(BigInt("0"))).eventually.be.rejectedWith('Invalid amount');
    });

    it('cannot convert because amount is greater than user\'s balance', async () => {
      // user1 approve 1001 source token to migrate contract
      await contracts.user1.sourceToken.approve(contracts.migrateToken.address, BigInt("1001"));

      // user1 convert 1001 source token to target token
      await expect(contracts.user1.migrateToken.convert(BigInt("1001"))).eventually.be.rejectedWith('ERC20: transfer amount exceeds balance');
    });

    it('cannot convert because amount is greater than migrate contract\'s balance', async () => {
      // transfer 1000 target token to user1
      await contracts.owner.targetToken.transfer(user1.address, BigInt("1000"));

      // user1 approve 1500 source token to migrate contract
      await contracts.user1.sourceToken.approve(contracts.migrateToken.address, BigInt("1500"));

      // user1 convert 1000 source token to target token
      await expect(contracts.user1.migrateToken.convert(BigInt("1500"))).eventually.be.rejectedWith('ERC20: transfer amount exceeds balance');
    });

    it('user can convert successfully', async () => {
      // query the source token balance and target token balance of user1 before convert
      const user1SourceTokenBalance = await contracts.user1.sourceToken.balanceOf(user1.address);
      const user1TargetTokenBalance = await contracts.user1.targetToken.balanceOf(user1.address);

      // query the source token balance and target token balance of migrate contract before convert
      const migrateSourceTokenBalance = await contracts.sourceToken.balanceOf(contracts.migrateToken.address);
      const migrateTargetTokenBalance = await contracts.targetToken.balanceOf(contracts.migrateToken.address);

      // user1 approve 500 source token to migrate contract
      await contracts.user1.sourceToken.approve(contracts.migrateToken.address, BigInt("500"));

      // user1 convert 1000 source token to target token
      await contracts.user1.migrateToken.convert(BigInt("500"));

      // query the source token balance and target token balance of user1 after convert
      const user1SourceTokenBalanceAfter = await contracts.user1.sourceToken.balanceOf(user1.address);
      const user1TargetTokenBalanceAfter = await contracts.user1.targetToken.balanceOf(user1.address);

      // query the source token balance and target token balance of migrate contract after convert
      const migrateSourceTokenBalanceAfter = await contracts.sourceToken.balanceOf(contracts.migrateToken.address);
      const migrateTargetTokenBalanceAfter = await contracts.targetToken.balanceOf(contracts.migrateToken.address);

      // the source token balance of user1 must be user1SourceTokenBalance - 500
      expect(user1SourceTokenBalanceAfter).to.equal(user1SourceTokenBalance - BigInt("500"));

      // the target token balance of user1 must be user1TargetTokenBalance + 500
      expect(user1TargetTokenBalanceAfter).to.equal(user1TargetTokenBalance + BigInt("500"));

      // the source token balance of migrate contract must be migrateSourceTokenBalance + 500
      expect(migrateSourceTokenBalanceAfter).to.equal(migrateSourceTokenBalance + BigInt("500"));

      // the target token balance of migrate contract must be migrateTargetTokenBalance - 500
      expect(migrateTargetTokenBalanceAfter).to.equal(migrateTargetTokenBalance - BigInt("500"));
    });

    it('user can convert successfully twice', async () => {
      // query the source token balance and target token balance of user1 before convert
      const user1SourceTokenBalance = await contracts.user1.sourceToken.balanceOf(user1.address);
      const user1TargetTokenBalance = await contracts.user1.targetToken.balanceOf(user1.address);

      // query the source token balance and target token balance of migrate contract before convert
      const migrateSourceTokenBalance = await contracts.sourceToken.balanceOf(contracts.migrateToken.address);
      const migrateTargetTokenBalance = await contracts.targetToken.balanceOf(contracts.migrateToken.address);

      // user1 approve 500 source token to migrate contract
      await contracts.user1.sourceToken.approve(contracts.migrateToken.address, BigInt("500"));

      // user1 convert 1000 source token to target token
      await contracts.user1.migrateToken.convert(BigInt("500"));

      // query the source token balance and target token balance of user1 after convert
      const user1SourceTokenBalanceAfter = await contracts.user1.sourceToken.balanceOf(user1.address);
      const user1TargetTokenBalanceAfter = await contracts.user1.targetToken.balanceOf(user1.address);

      // query the source token balance and target token balance of migrate contract after convert
      const migrateSourceTokenBalanceAfter = await contracts.sourceToken.balanceOf(contracts.migrateToken.address);
      const migrateTargetTokenBalanceAfter = await contracts.targetToken.balanceOf(contracts.migrateToken.address);

      // the source token balance of user1 must be user1SourceTokenBalance - 500
      expect(user1SourceTokenBalanceAfter).to.equal(user1SourceTokenBalance - BigInt("500"));

      // the target token balance of user1 must be user1TargetTokenBalance + 500
      expect(user1TargetTokenBalanceAfter).to.equal(user1TargetTokenBalance + BigInt("500"));

      // the source token balance of migrate contract must be migrateSourceTokenBalance + 500
      expect(migrateSourceTokenBalanceAfter).to.equal(migrateSourceTokenBalance + BigInt("500"));

      // the target token balance of migrate contract must be migrateTargetTokenBalance - 500
      expect(migrateTargetTokenBalanceAfter).to.equal(migrateTargetTokenBalance - BigInt("500"));
    });
  });
});
