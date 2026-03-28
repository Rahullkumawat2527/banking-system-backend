import accountModel from "../models/account.models.js"



async function createAccount(req, res) {

    const user = req.user

    const newAccount = await accountModel.create({
        user: user._id
    })

    return res.status(201)
        .json({
            message: "account created successfully",
            newAccount
        })

}


async function getUserAccounts(req, res) {

    console.log(req.user._id)
    const userAllAccounts = await accountModel.find({ user: req.user._id })

    return res.status(200)
        .json({
            message: "below accounts are the user account",
            userAllAccounts
        })


}


async function getUserAccountBalance(req, res) {

    const {accountId} = req.params

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })


    if (!account) {
        return res.status(404)
            .json({
                message: "Account not found"
            })
    }

    const balance = await account.getBalance()

    return res.status(200)
        .json({
            message: "balance fetched successfully",
            balance

        })



}
export { createAccount, getUserAccounts, getUserAccountBalance }