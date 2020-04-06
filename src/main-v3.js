// Module to create a SHA256 representation.
// https://cryptojs.gitbook.io/docs/
const SHA256 = require("crypto-js/sha256");
const Stopwatch = require('statman-stopwatch');
const gDIFFICULTY = 2

// Block is the fundamental element of a blockchain
// Block consist of:
// previousHash - 
// timestamp    - the timestamp when the block was created
// transactions - the associate data/ information that is stored in the 'block'
// hash         - a 256 bit code calculation e.g 
//               000f06cb3086469dc96cd479d9471eb3ed54f95ca81aa1937bb65781c1e8d7821586192887757
// nonce - is a random or semi-random number that is generated for a specific use, 
//         typically related to cryptographic communication or information technology. 
//         The term itself stands for “number used once” or “number once” and is most 
//         commonly referred to specifically as a cryptographic nonce.

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
		let data = this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce
        return SHA256(data).toString();
    }

    mineBlock(difficulty) {
        let rhs = ""
        let lhs = ""
        const sw = new Stopwatch(true);

		while ((lhs = this.hash.substring(0, difficulty)) !== (rhs = Array(difficulty + 1).join("0"))) {
			this.nonce++;
            this.hash = this.calculateHash();
        }
        sw.stop();
        console.log("BLOCK MINED: " + this.hash + ' took: ' + sw.read() + " ms");
    }
}

class BlockChain{
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = gDIFFICULTY;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block(Date.parse("2020-04-01"), [], "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    createTransaction(transaction) {
        // Transaction to pendingTransactions array.
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
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

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

function dumpBlockChain (blockChain) {
    console.log('Dump BlockChain.................');
    console.log('Pending Transactions Length: ' + blockChain.pendingTransactions.length);
    for(const pendingTransaction of blockChain.pendingTransactions) { console.log("pendingTransaction:", pendingTransaction) }

    console.log('Chain Length: ' + blockChain.chain.length);
    for(const block of blockChain.chain) { console.log("Block:", block) }
}

let myCoin = new BlockChain();
dumpBlockChain(myCoin)


myCoin.createTransaction(new Transaction('address1', 'address2', 1000));
dumpBlockChain(myCoin)

myCoin.createTransaction(new Transaction('address2', 'address1', 5000));
dumpBlockChain(myCoin)

console.log('Starting the miner...');
myCoin.minePendingTransactions('address1');
dumpBlockChain(myCoin)

console.log('Balance of myCoin is', myCoin.getBalanceOfAddress('address1'));

console.log('Starting the miner again...');

myCoin.minePendingTransactions('address2');
console.log('Balance of myCoin is', myCoin.getBalanceOfAddress('address'));
dumpBlockChain(myCoin)

// dump Blockchain


