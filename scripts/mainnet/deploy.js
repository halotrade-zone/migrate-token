module.exports = async ({
  getNamedAccounts,
  deployments,
}) => {
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const old_aura_contract = '0x23c5d1164662758b3799103effe19cc064d897d6';
  const celer_aura_contract = '0x01a2df2ca978f9e75e2ecc56bf7158018ff123c2';

  let migrate_contract = await deploy('MigrateToken', {
    from: deployer,
    gasLimit: 6000000,
    args: [old_aura_contract, celer_aura_contract],
    log: true
  });

  console.log('migration contract address: ', migrate_contract.address);

  // transfer ownership to minter if necessary
  const new_owner = '0xf85eFCACd5d3Cc669158fF4949BF5D4EF8F23D89';
  await execute(
    'MigrateToken',
    { from: deployer, log: true, gasLimit: 60000 },
    'transferOwnership',
    new_owner,
  );
};

module.exports.tags = ['mirate_contract'];
