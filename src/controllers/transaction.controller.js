import { transactionModel } from "../models/transaction.models.js";
import accountModel from "../models/account.models.js";
import mongoose from "mongoose"
import ledgerModel from "../models/ledger.models.js";
// import { sendTransactionEmail } from "../services/email.service.js";
import jwt from "jsonwebtoken"


async function createTransaction(req, res) {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    // step 1. accessing the userID from the loginToken 
    const token = req.cookies.loginToken
    const decoded = jwt.verify(token, process.env.JWT_SECRET)


    // Step 2: Find accounts associated with logged-in user
    const userAccounts = await accountModel.find({ user: decoded.userID });

    if (!userAccounts || userAccounts.length === 0) {
        return res.status(404).json({
            message: "No accounts found for this user,create one then only you can made transactions"
        });
    }

    // Step 3: Verify fromAccount belongs to logged-in user
    const isAuthorized = userAccounts.some(account =>
        account._id.toString() === fromAccount
    );

    if (!isAuthorized) {
        return res.status(403).json({
            message: "Unauthorized: You can only send money from your own accounts"
        });
    }

    // step  validate request
    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })
    if (!fromUserAccount) {
        return res.status(404)
            .json({
                message: "please Provide a valid fromAccount"
            })
    }

    if (!toUserAccount) {
        return res.status(404)
            .json({
                message: "please Provide a valid toAccount"
            })
    }

    // step 2 validate idonpotency key
    const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === 'COMPLETED') {
            return res.status(200)
                .json({
                    message: "Transaction already processed",
                    transaction: isTransactionAlreadyExists
                })
        }

        if (isTransactionAlreadyExists.status === 'PENDING') {
            return res.status(409)
                .json({
                    message: "Transaction is still processing"
                })
        }
        if (isTransactionAlreadyExists.status === 'FAILED') {
            return res.status(500)
                .json({
                    message: "Transaction processing Failed,please try again"
                })
        }

        if (isTransactionAlreadyExists.status === 'REVERSED') {
            return res.status(500)
                .json({
                    message: "Transaction was reversed ,please retry"
                })
        }
    }

    // check account status,
    // ki hamara fromaccount or toaccount active hone chahiye tabhi hame transaction aage process karenge

    if (fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE') {
        return res.status(400)
            .json({
                message: "both fromAccount and toAccount must be active to process transaction"
            })
    }

    // derive sender balance from ledger

    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        return res.status(400)
            .json({
                message: `Insufficient balance in account. current balance is ${balance} and requested amount is ${amount}`
            })
    }

    // yaha se hum ek session start kar rhe h using mongoose.startSession
    const session = await mongoose.startSession()
    try {
        session.startTransaction()

        //step 5. create transaction with status PENDING
        const [newTransaction] = await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: 'PENDING'
        }], { session })

        // step 6. create DEBIT ledger entry in fromAccount

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            transaction: newTransaction._id,
            amount: amount,
            transactionType: 'DEBIT'
        }], { session })

        await (() => {
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000))
        })()

        // step 7 create CREDIT ledger entry in toAccount
        const creaditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            transaction: newTransaction._id,
            amount: amount,
            transactionType: 'CREDIT'
        }], { session })


        // step 8 marks the newTransaction status as completed
        await transactionModel.findOneAndUpdate(
            { _id: newTransaction._id },
            {
                status: "COMPLETED"
            },
            { session }
        )


        // step 9 commit session
        await session.commitTransaction()

        // Verify the balance after transaction
        const updatedBalance = await fromUserAccount.getBalance()

        return res.status(201)
            .json({
                message: "transaction completed successfully",
                newTransaction,
                updatedBalance
            })

    } catch (error) {
        // await session.abortTransaction()
        // console.error("Transaction is Pending due to some issue,please retry after some time")
        return res.status(500).json({
            message: "Transaction is Pending due to some issue, please retry after some time",
            // error: error.message
        })
    } finally {
        session.endSession()
    }

}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body


    const toAccountExists = await accountModel.findOne({
        _id: toAccount
    })

    if (!toAccountExists) {
        return res.status(400)
            .json({
                message: "Invalid toAccount"
            })
    }


    // to made a transaction to account we should have a fromAccount

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400)
            .json({
                message: "System user account not found"
            })
    }

    // start a session
    const session = await mongoose.startSession()

    try {

        session.startTransaction()

        // create a transaction
        const [transaction] = await transactionModel.create([{
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: 'PENDING'
        }], { session })

        // create a debit ledger entry from system user
        const debitLedgerEntry = await ledgerModel.create([{
            account: fromUserAccount._id,
            transaction: transaction._id,
            amount,
            transactionType: 'DEBIT'
        }], { session })

        // create a creadit ledger entry to the toAccount
        const creaditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            transaction: transaction._id,
            amount,
            transactionType: 'CREDIT'

        }], { session })

        // marks the newTransaction status as completed 
        transaction.status = 'COMPLETED'
        await transaction.save({ session })

        // step 9 commit session
        await session.commitTransaction()

        // Verify the balance after transaction
        const updatedBalance = await toAccountExists.getBalance()

        return res.status(201)
            .json({
                message: "Initial fund transaction completed successfully",
                transaction,
                newBalance: updatedBalance
            })

    } catch (error) {
        await session.abortTransaction()
        console.error("Transaction failed:", error)
        return res.status(500).json({
            message: "Transaction failed",
            error: error.message
        })
    } finally {
        session.endSession()
    }

}
export { createTransaction, createInitialFundsTransaction }