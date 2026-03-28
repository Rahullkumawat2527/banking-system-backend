import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "transaction must be assoicated with a FROM account"],
        index: true
    },

    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "transaction must be assoicated with a TO account"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'],
            message: "status can be either PENDING,COMPLETED,FAILED or REVERSED"
        },
        default: 'PENDING',
    },
    amount: {
        type: Number,
        required: [true, "Amount is required for creating a transaction"],

    },
    idempotencyKey: {
        type: String,
        required: [true, 'idempotency key is required for each transaction'],
        index: true,
        unique: true
    }

}, { timestamps: true })    

const transactionModel = mongoose.model("transaction", transactionSchema)



export { transactionModel }