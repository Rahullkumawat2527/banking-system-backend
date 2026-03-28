import jwt from "jsonwebtoken"
import userModel from "../models/user.models.js"
import tokenBlackListModel from "../models/tokenBlacklist.model.js"

async function authMiddleware(req, res, next) {

    const token = req.cookies.loginToken || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401)
            .json({
                message: "unauthorized accesss, loginToken is missing",
            })
    }

    // kahi token already blacklisted to nhi ha ye bhi hum yaha check karenge aur agar token alrerady blacklisted ha to hum yaha se hi user ko response send kar denge

    const isTokenBlackListed = await tokenBlackListModel.findOne({ token })

    if (isTokenBlackListed) {
        res.status(401)
            .json({
                message: "unauthorized user"
            })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findOne({ _id: decoded.userID })
        console.log(user)


        req.user = user

        return next()
    } catch (error) {
        console.log(error)
        return res.status(404)
            .json({
                message: "Unauthorized access , token is invalid"
            })

    }

}

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.loginToken || req.headers.authorization?.split("")[1]

    if (!token) {
        return res.status(401)
            .json({
                message: "unauthorized user"
            })
    }

    // yaha check karenge ki user ke pass jo token ha khi wo already blacklisted to nhi ha agar h to hum user ko yahi se response send kar denge

    const isTokenBlackListed = await tokenBlackListModel.findOne({ token })

    if (isTokenBlackListed) {
        return res.status(401)
            .json({
                message: "Unauthorized access,token is missing"
            })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.userID).select("+systemUser")

        // check whether the loged in user is system user or not
        if (!user.systemUser) {
            return res.status(403)
                .json({
                    message: "forbidden user,not a system user"
                })
        }

        req.user = user
        next()
    } catch (error) {

        return res.status(401).
            json({
                message: "Invalid Token"
            })
    }
}

export { authMiddleware, authSystemUserMiddleware }
