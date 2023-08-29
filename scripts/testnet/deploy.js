module.exports = async ({
  getNamedAccounts,
  deployments,
}) => {
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const minter = '0x4dC0ce5d2F410085B0Aa3f60c9fFA2f662Aa38D8';

  let source_token = await deploy('SimpleERC20', {
    from: deployer,
    gasLimit: 4000000,
    args: ['SOURCE', minter],
    log: true
  });

  console.log('source_token.address', source_token.address);

  let target_token = await deploy('SimpleERC20', {
    from: deployer,
    gasLimit: 4000000,
    args: ['TARGET', minter],
    log: true
  });

  console.log('target_token.address', target_token.address);

  let migrate_contract = await deploy('MigrateToken', {
    from: deployer,
    gasLimit: 6000000,
    args: [source_token.address, target_token.address],
    log: true
  });

  await execute(
    'MigrateToken',
    { from: deployer, log: true, gasLimit: 60000 },
    'transferOwnership',
    minter,
);
};

module.exports.tags = ['mirate_contract'];
