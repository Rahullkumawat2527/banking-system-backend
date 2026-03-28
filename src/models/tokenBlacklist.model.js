import mongoose from "mongoose";

const tokenBlackListSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "token is required to blacklist"],
        unique: [true, "token is already blacklisted"]
    },

    blackListedAt: {
        type: Date,
        default: Date.now(),
        immutable: true

    }
}, { timestamps: true })

tokenBlackListSchema.index(
    {createdAt : 1},
    {expireAfterSeconds : 60*60*24*30} // after 3 days the token we blacklisted would be gone from database
)

const tokenBlackListModel = mongoose.model("tokenBlackList",tokenBlackListSchema)

export default tokenBlackListModel