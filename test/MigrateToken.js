const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const { expect } = chai;
const { ethers } = require('hardhat');

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

        const sourceTokenAddress = await contracts.sourceToken.getAddress();
        const targetTokenAddress = await contracts.targetToken.getAddress();

        // deploy migrate contract
        contracts.migrateToken = await MIGRATE_CONTRACT.deploy(sourceTokenAddress, targetTokenAddress);

        // transfer some source tokens to user1
        await contracts.sourceToken.transfer(user1.address, BigInt("10000000"));

        // transfer some source tokens to user2
        await contracts.sourceToken.transfer(user2.address, BigInt("10000000"));

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
      // query the balance of user1
      const user1Balance = await contracts.sourceToken.balanceOf(user1.address);
      expect(user1Balance).to.equal(BigInt("10000000"));

      // query the balance of user2
      const user2Balance = await contracts.sourceToken.balanceOf(user2.address);
      expect(user2Balance).to.equal(BigInt("10000000"));

      expect(await contracts.sourceToken.getAddress()).to.be.a('string');
      expect(await contracts.targetToken.getAddress()).to.be.a('string');
      expect(await contracts.migrateToken.getAddress()).to.be.a('string');
    });

    // describe('Listings with native currency', () => {
    //     it('cannot create a listing with native currency', async () => {
    //         const tokenId = await getTestToken(user1.address, contracts.nft);
    //         await contracts.user1.nft.approve(contracts.marketplace.address, tokenId);
    //         expect(
    //             contracts.user1.marketplace.listNft(
    //                 contracts.nft.address,
    //                 tokenId,
    //                 price,
    //                 ethers.constants.AddressZero,
    //             ),
    //         ).eventually.be.rejectedWith('Currency not allowed');
    //     });
    // });

    // describe('Listings with ERC20', () => {
    //     before('deploy erc20 token', async () => {
    //         const ERC20 = await ethers.getContractFactory('SimpleERC20');
    //         contracts.erc20 = await ERC20.deploy();
    //         await contracts.erc20.deployed();
    //         contracts.user2.erc20 = contracts.erc20.connect(user2);

    //         // give user2 some tokens to spend
    //         await contracts.erc20.transfer(user2.address, price * 10000);
    //     });

    //     it('cannot create a listing without approval for token', async () => {
    //         const tokenId = await getTestToken(user1.address, contracts.nft);
    //         return expect(
    //             contracts.user1.marketplace.listNft(
    //                 contracts.nft.address,
    //                 tokenId,
    //                 price,
    //                 contracts.erc20.address,
    //             ),
    //         ).eventually.be.rejectedWith('Currency not allowed');
    //     });

    //     it('cannot listing because contract address is not allowed', async () => {
    //         const tokenId = await getTestToken(user1.address, contracts.nft);
    //         await contracts.marketplace.addCurrency(contracts.erc20.address);
    //         await contracts.user1.nft.approve(contracts.marketplace.address, tokenId);
    //         return expect(
    //         contracts.user1.marketplace.listNft(
    //             contracts.nft.address,
    //             tokenId,
    //             price,
    //             contracts.erc20.address,
    //         )).eventually.to.be.rejectedWith('Tokenn contract not allowed');
    //     });

    //     it('cannot add new NFT contract because not admin', async () => {
    //         const tokenId = await getTestToken(user1.address, contracts.nft);
    //         await contracts.marketplace.addCurrency(contracts.erc20.address);
    //         await contracts.user1.nft.approve(contracts.marketplace.address, tokenId);
    //         return expect(
    //         contracts.user1.marketplace.addNftContract(contracts.nft.address)).eventually.to.be.rejectedWith('AccessControl');
    //     });

    //     it('cannot cancel after sold', async () => {
    //         const tokenId = await getTestToken(user1.address, contracts.nft);
    //         await contracts.marketplace.addCurrency(contracts.erc20.address);
    //         await contracts.user1.nft.approve(contracts.marketplace.address, tokenId);

    //         // admin must allows to use nft contract in marketplace
    //         await contracts.marketplace.addNftContract(contracts.nft.address);

    //         await contracts.user1.marketplace.listNft(
    //             contracts.nft.address,
    //             tokenId,
    //             price,
    //             contracts.erc20.address,
    //         );

    //         await contracts.user2.erc20.approve(contracts.marketplace.address, price);
    //         await contracts.user2.marketplace.buy(contracts.nft.address, tokenId, price, contracts.erc20.address);

    //         return expect(contracts.user1.marketplace.cancelListing(contracts.nft.address, tokenId))
    //         .eventually.be.rejectedWith('Token not listed for sale');
    //     });

    //     it("cannot cancel other's listing", async () => {
    //         const tokenId = await getTestToken(user1.address, contracts.nft);
    //         await contracts.marketplace.addCurrency(contracts.erc20.address);
    //         await contracts.user1.nft.approve(contracts.marketplace.address, tokenId);
    //         await contracts.user1.marketplace.listNft(
    //             contracts.nft.address,
    //             tokenId,
    //             price,
    //             contracts.erc20.address,
    //         );

    //         return expect(contracts.user2.marketplace.cancelListing(contracts.nft.address, tokenId))
    //         .eventually.be.rejectedWith('Only seller can cancel');
    //     });

    //     it('can cancel', async () => {
    //         const tokenId = await getTestToken(user1.address, contracts.nft);
    //         await contracts.marketplace.addCurrency(contracts.erc20.address);
    //         await contracts.user1.nft.approve(contracts.marketplace.address, tokenId);
    //         await contracts.user1.marketplace.listNft(
    //             contracts.nft.address,
    //             tokenId,
    //             price,
    //             contracts.erc20.address,
    //         );

    //         await contracts.user1.marketplace.cancelListing(contracts.nft.address, tokenId);
    //         expect(await contracts.nft.ownerOf(tokenId)).to.be.equal(user1.address);
    //     });
    //     describe('Create listing - Buy a NFT', async () => {
    //         let tokenId;
    //         it('can create a listing after approval of currency', async () => {
    //             tokenId = await getTestToken(user1.address, contracts.nft);
    //             await contracts.marketplace.addCurrency(contracts.erc20.address);
    //             await contracts.user1.nft.approve(contracts.marketplace.address, tokenId);
    //             await contracts.user1.marketplace.listNft(
    //                 contracts.nft.address,
    //                 tokenId,
    //                 price,
    //                 contracts.erc20.address,
    //             );
    //             const listing = await contracts.marketplace.listings(contracts.nft.address, tokenId);
    //             expect(listing.seller).to.be.equal(user1.address);
    //             expect(listing.price.eq(price)).to.be.true;
    //             expect(listing.startAt.gt(0)).to.be.true;
    //             expect(listing.currency).to.be.equal(contracts.erc20.address);
    //         });

    //         it('cannot buy without approve spend token', async () => {
    //             return expect(
    //                 contracts.user2.marketplace.buy(contracts.nft.address, tokenId, price, contracts.erc20.address),
    //             ).eventually.be.rejectedWith("VM Exception while processing transaction: reverted with reason string 'ERC20: insufficient allowance'");
    //         });

    //         it('cannot buy without enough token', async () => {
    //             await contracts.user2.erc20.approve(contracts.marketplace.address, 9999);
    //             return expect(
    //                 contracts.user2.marketplace.buy(contracts.nft.address, tokenId, price, contracts.erc20.address),
    //             ).eventually.be.rejectedWith("VM Exception while processing transaction: reverted with reason string 'ERC20: insufficient allowance'");
    //         });

    //         it('can buy with more than enough token', async () => {
    //             const currentContractBalance = await contracts.erc20.balanceOf(contracts.marketplace.address);
    //             const currentSellerBalance = await contracts.erc20.balanceOf(user1.address);
    //             const currentBuyerBalance = await contracts.erc20.balanceOf(user2.address);

    //             await contracts.user2.erc20.approve(contracts.marketplace.address, price);
    //             await contracts.user2.marketplace.buy(contracts.nft.address, tokenId, price, contracts.erc20.address);
    //             expect(await contracts.nft.ownerOf(tokenId)).to.be.equal(user2.address);

    //             const newContractBalance = await contracts.erc20.balanceOf(contracts.marketplace.address);
    //             const newSellerBalance = await contracts.erc20.balanceOf(user1.address);
    //             const newBuyerBalance = await contracts.erc20.balanceOf(user2.address);

    //             expect(newContractBalance.eq(currentContractBalance.add(price / 100 * feeRate))).to.be.true;
    //             expect(newSellerBalance.eq(currentSellerBalance.add(price / 100 * (100 - feeRate)))).to.be.true;
    //             expect(newBuyerBalance.eq(currentBuyerBalance.sub(price))).to.be.true;
    //         });
    //     });
    // });

    // describe('Special Fee', () => {
    //     it('can set special fee for nft contract address', async () => {
    //         const currentSpecialFee = await contracts.marketplace.specialFee(contracts.nft.address);
    //         expect(currentSpecialFee.enabled).to.equal(false);

    //         await contracts.marketplace.setSpecialFee(contracts.nft.address, 5);
    //         const newSpecialFee = await contracts.marketplace.specialFee(contracts.nft.address);
    //         expect(newSpecialFee.enabled).to.equal(true);
    //         expect(newSpecialFee.rate.eq(5)).to.be.true;
    //     });

    //     it('can remove special fee for nft contract address', async () => {
    //         const currentSpecialFee = await contracts.marketplace.specialFee(contracts.nft.address);
    //         expect(currentSpecialFee.enabled).to.equal(true);

    //         await contracts.marketplace.removeSpecialFee(contracts.nft.address);
    //         const newSpecialFee = await contracts.marketplace.specialFee(contracts.nft.address);
    //         expect(newSpecialFee.enabled).to.equal(false);
    //     });

    //     it('can remove non existent nft contract address', async () => {
    //         expect(await contracts.marketplace.removeSpecialFee(contracts.nft.address)).to.be.ok;
    //     });

    //     it('change fee according to special fee - erc20', async () => {
    //         feeRate = 5;
    //         await contracts.marketplace.setSpecialFee(contracts.nft.address, feeRate);

    //         // user1 puts a token on sale
    //         tokenId = await getTestToken(user1.address, contracts.nft);
    //         await contracts.user1.nft.approve(contracts.marketplace.address, tokenId);
    //         await contracts.user1.marketplace.listNft(
    //             contracts.nft.address,
    //             tokenId,
    //             price,
    //             contracts.erc20.address,
    //         );

    //         const currentContractBalance = await contracts.erc20.balanceOf(contracts.marketplace.address);
    //         const currentSellerBalance = await contracts.erc20.balanceOf(user1.address);
    //         const currentBuyerBalance = await contracts.erc20.balanceOf(user2.address);

    //         // user2 buys the token
    //         await contracts.user2.erc20.approve(contracts.marketplace.address, price);
    //         await contracts.user2.marketplace.buy(contracts.nft.address, tokenId, price, contracts.erc20.address);
    //         expect(await contracts.nft.ownerOf(tokenId)).to.be.equal(user2.address);

    //         const newContractBalance = await contracts.erc20.balanceOf(contracts.marketplace.address);
    //         const newSellerBalance = await contracts.erc20.balanceOf(user1.address);
    //         const newBuyerBalance = await contracts.erc20.balanceOf(user2.address);

    //         expect(newContractBalance.eq(currentContractBalance.add(price / 100 * feeRate))).to.be.true;
    //         expect(newSellerBalance.eq(currentSellerBalance.add(price / 100 * (100 - feeRate)))).to.be.true;
    //         expect(newBuyerBalance.eq(currentBuyerBalance.sub(price))).to.be.true;
    //     });
    // });

    // describe('Admin withdraw funds', () => {
    //     it('admin can withdraw native currency', async () => {
    //         const currentContractBalance = await ethers.provider.getBalance(contracts.marketplace.address);
    //         const currentOwnerBalance = await ethers.provider.getBalance(owner.address);

    //         const tx = await contracts.marketplace.adminClaim(ethers.constants.AddressZero);
    //         const receipt = await tx.wait();
    //         const expectedBalance = currentOwnerBalance.sub(receipt.gasUsed.mul(receipt.effectiveGasPrice)).add(currentContractBalance);

    //         const newContractBalance = await ethers.provider.getBalance(contracts.marketplace.address);
    //         const newOwnerBalance = await ethers.provider.getBalance(owner.address);

    //         expect(newContractBalance.eq(0)).to.be.true;
    //         expect(newOwnerBalance.eq(expectedBalance)).to.be.true;
    //     });

    //     it('admin can withdraw erc20', async () => {
    //         const currentContractBalance = await contracts.erc20.balanceOf(contracts.marketplace.address);
    //         const currentOwnerBalance = await contracts.erc20.balanceOf(owner.address);

    //         await contracts.marketplace.adminClaim(contracts.erc20.address);

    //         const newContractBalance = await contracts.erc20.balanceOf(contracts.marketplace.address);
    //         const newOwnerBalance = await contracts.erc20.balanceOf(owner.address);

    //         expect(newContractBalance.eq(0)).to.be.true;
    //         expect(newOwnerBalance.eq(currentOwnerBalance.add(currentContractBalance))).to.be.true;
    //     });

    //     it('others cannot withdraw native currency', async () => expect(contracts.user1.marketplace.adminClaim(ethers.constants.AddressZero)).eventually.be.rejectedWith('AccessControl'));

    //     it('others cannot withdraw erc20', async () => expect(contracts.user1.marketplace.adminClaim(contracts.erc20.address)).eventually.be.rejectedWith('AccessControl'));
    // });
});
