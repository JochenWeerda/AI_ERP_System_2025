/**
 * Transaction-Modul fÃ¼r finance-core
 * @module finance-core/transaction
 */

// Minimale Implementierung fÃ¼r finance-core/transaction

class Transaction {
    constructor() {
        this.name = 'Transaction';
        this.module = 'finance-core';
    }

    init() {
        console.log(Initialisiere  in Modul );
        return true;
    }
}

const instance = new Transaction();

module.exports = {
    Transaction,
    default: instance
};
