const TokenTracker = require('@metamask/eth-token-tracker');
const Web3 = require('web3');

// 1. Setup Web3 provider (Infura or local Geth)
const provider = new Web3.providers.HttpProvider('https://elparadisogonzalo.com');

// 2. Define user and token addresses
const userAddress = '0x802ba6a112f4a7bbbc2d63c8ef4bc14dfcbe6245'; // Replace with yours
const tokenAddress = '0x6b175474e89094c44da98b954eedeac495271d0f'; // Example: DAI
const otherTokenAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'; // Example: USDC

// 3. Initialize TokenTracker
const tokenTracker = new TokenTracker({
  userAddress,
  provider,
  pollingInterval: 8000,
  tokens: [{ address: tokenAddress }]
});

// 4. Listen for balance updates
tokenTracker.on('update', function (balances) {
  balances.forEach((bal) => {
    console.log(`Balance of ${bal.symbol}: ${bal.string}`);
  });
});

// 5. Add another token after initialization
tokenTracker.add({ address: otherTokenAddress });

// Optional: check initial state
const serialized = tokenTracker.serialize();
console.log('Initial balances:', serialized);

// Exit safely after some time
setTimeout(() => {
  tokenTracker.stop();
  console.log('Stopped tracking.');
  process.exit(0);
}, 30000);
