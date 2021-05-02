const SHA256 = require('crypto-js/sha256')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transactions{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transactions for other wallets');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0){
            throw new error('No signature in this transaction');
        }

        const publickey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publickey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.Hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while(this.Hash.substring(0, difficulty) !== Array(difficulty +1).join("0")){
            this.nonce++;
            this.Hash = this.calculateHash();
        }

        console.log("Block mined: " + this.Hash);

    }

    hasValidTranscation(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }

        return true;
    }
}


class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100
   }

   createGenesisBlock(){
       return new Block("01/05/2021", "Genesis block", "0");
   }

   getLatestBlock(){
        return this.chain[this.chain.length - 1];
   }

   minePendingTransactions(miningRewardAddress){
       let block = new Block(Date.now(), this.pendingTransactions);
       block.mineBlock(this.difficulty);

       console.log('Block sucessfully mined!');
       this.chain.push(block);

       this.pendingTransactions =[
           new Transactions(null, miningRewardAddress, this.miningReward)
       ];
   }
   
   getBalanceOfAddress(address){
       let balance = 0;

       for(const block of this.chain){
           for(const trans of block.transactions){
               if(trans.fromAddress === address){
                   balance -= trans.amount;
               }

               if(trans.toAddress === address){
                   balance += trans.amount;
               }
           }
       }

       return balance;
   }


   addTransactions(transactions){

        if(!transactions.fromAddress || !transactions.toAddress){
            throw new Error('Transaction must include a from and to address');
        }

        if(!transactions.isValid()){
            throw new Error('Cannot add invalid transactions to the chain');
        }

       this.pendingTransactions.push(transactions);
   }

   isChainValid(){
       for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidTranscation()){
                return false;
            }

            if(currentBlock.Hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.Hash){
                return false;
            }
       }

       return true;
   }

}

module.exports.Blockchain = Blockchain;
module.exports.Transactions = Transactions;