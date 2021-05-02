const {Blockchain, Transactions} = require('./megachain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('5cb4ba8ed82c4447bd1ec364b9667e8f11884ab2012c4bb1c8d7a23f67d91dde')
const myWalletAddress = myKey.getPublic('hex')

let megaCoin = new Blockchain

const tx1 = new Transactions(myWalletAddress, 'Public Key goes here', 10);
tx1.signTransaction(myKey);
megaCoin.addTransactions(tx1);


console.log('\n staring the miner...');
megaCoin.minePendingTransactions(myWalletAddress);

console.log('\nBalence is ', megaCoin.getBalanceOfAddress(myWalletAddress));


