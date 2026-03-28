import mongoose from "mongoose";
import ledgerModel from "./ledger.models.js"

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Account must be associated with a user"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['ACTIVE', 'FROZEN', 'CLOSED'],
            message: 'Status can be either Active,Frozen or Closed',

        },
        default: 'ACTIVE'
    },
    curreny: {
        type: String,
        required: true,
        default: 'INR'
    }
}, { timestamps: true })

accountSchema.index({ user: 1, status: 1 })

accountSchema.methods.getBalance = async function () {
    console.log(`Getting balance for account: ${this._id}`)

    const ledgerEntries = await ledgerModel.find({ account: this._id })
    console.log(`Ledger entries found: ${ledgerEntries.length}`)
    
    const balanceData = await ledgerModel.aggregate([
        { $match: { account: this._id } },
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$transactionType", 'DEBIT'] },
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$transactionType", 'CREDIT'] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: { $subtract: ["$totalCredit", "$totalDebit"] }
            }
        }
    ])

    console.log(`Balance calculation result:`, balanceData)

    // agar user naya create huwa ha to usne ek bhi transaction nhi kiya to ye uper wali wuery hame empty array return karengi to hume wo handle karna padega using length property
    if (balanceData.length === 0) {
        return 0
    }

    return balanceData[0].balance


}

const accountModel = mongoose.model("account", accountSchema)

export default accountModel