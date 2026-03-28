import mongoose from "mongoose"

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "ledger must be associated with an account"],
        index: true,
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "transaction",
        required: [true, "Ledger must be associated with a transaction"],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true, " Amount is required for creating a ledger entry"],
        immutable: true
    },

    transactionType: {
        type: String,
        enum: {
            values: ['CREDIT', 'DEBIT'],
            message: "transactiontype can be either CREDIT or DEBIT"
        },
        immutable: true
    }
})

function preventLedgerModification() {
    throw new Error("Ledger entries are immutable and cannot be modified or deleted")
}

const immutableOps = [
    'updateOne', 'updateMany', 'findOneAndUpdate',
    'findOneAndReplace', 'replaceOne', 'deleteOne',
    'deleteMany', 'remove'
];

// implementing hook to prevent from modification of ledger entry
immutableOps.forEach((op) => {
    return ledgerSchema.pre(op, preventLedgerModification)
})

// if a entry in ledger model is not new then throw an error
// ledgerSchema.pre('save', function(next) {
//   if (!this.isNew) {
//     return next(new Error('Ledger entries are immutable'));
//   }
//   next();
// });

const ledgerModel = mongoose.model("ledger",ledgerSchema)

export default ledgerModel