const fs = require('fs');
const privateKey = fs.readFileSync('.secret').toString().trim();

require('@nomicfoundation/hardhat-toolbox');
require('hardhat-gas-reporter');
require('hardhat-deploy');
// require('@nomiclabs/hardhat-solhint');
// require('@openzeppelin/hardhat-upgrades');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  settings: {
    optimizer: {
        enabled: true,
        runs: 200,
    },
  },
  defaultNetwork: 'hardhat',
  networks: {
      local: {
          url: 'http://127.0.0.1:8545',
      },
      hardhat: {
          blockGasLimit: 70000000,
      },
      testnet: {
          url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
          chainId: 97,
          gasPrice: 'auto',
          accounts: [ privateKey ],
          gas: 20000000,
          timeout: 120000,
          throwOnTransactionFailures: true,
      },
      mainnet: {
          url: 'https://bsc-dataseed1.binance.org/',
          chainId: 56,
          gasPrice: 'auto',
          accounts: [ privateKey ],
          gas: 3000000,
          timeout: 120000,
          throwOnTransactionFailures: true,
      },
  },
  namedAccounts: {
    deployer: {
        default: 0,
        56: 0,
    },
  },
  paths: {
      deploy: 'scripts/mainnet',
      deployments: 'deployments',
  },
};
