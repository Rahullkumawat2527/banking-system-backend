import userModel from "../models/user.models.js";
import bcrypt from "bcrypt"
import { json } from "express";
import jwt from "jsonwebtoken"
import { sendVerificationEmail } from "../services/email.service.js";
import tokenBlackListModel from "../models/tokenBlacklist.model.js";



// user register controller
// /api/auth/register
async function registerUser(req, res) {

    const { email, username, password } = req.body


    const userAlreadyExist = await userModel.findOne({ email: email })

    if (userAlreadyExist) {
        return res.status(422)
            .json({
                message: "user already exist",
                status: "failed"
            })
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const newUser = await userModel.create({
        email,
        username,
        password: hashPassword
    })


    const token = jwt.sign({
        userID: newUser._id
    }, process.env.JWT_SECRET, { expiresIn: "3d" })


    // setting token in cookies
    res.cookie("registerToken", token)

    //  Send verification email
    const emailResult = await sendVerificationEmail(email, username)

    res.status(201).json({
        message: "user registered successfully,check your email for verification",
        newUser,
        registerToken: token
    })


}

// user login controller 
// /api/auth/login
async function loginUser(req, res) {

    const { email, username, password } = req.body
    // console.log(password)


    const user = await userModel.findOne({
        $or: [{ email }, { username }]
    }).select("+password")

    // console.log(user)

    if (!user) {
        return res.status(401)
            .json({
                message: "email or username is invalid"
            })
    }

    const isValidPassword = await user.comparePassword(password)

    if (!isValidPassword) {
        return res.status(401)
            .json({
                message: "password is invalid"
            })
    }

    // if username or email and password is correct then we will generate a token and send it back to the user for further use

    const token = jwt.sign({
        userID: user._id
    }, process.env.JWT_SECRET, { expiresIn: "3d" })

    if (!token) {
        return res.status(500)
            .json({
                message: "Error while generating token"
            })
    }

    // here what i am doing that when a user is logging in i am clearing the registerToken
    res.clearCookie("registerToken")

    res.cookie("loginToken", token)

    res.status(200).
        json({
            message: "user loged in successfully",
            user,
            loginToken: token
        })
}

// user logout controller 
// /api/auth/logout
async function logoutUser(req, res) {

    const token = req.cookies.loginToken || req.headers.authorization.split(" ")[1]

    if (!token) {
        res.status(200)
            .json({
                message: "user logout successfully"
            })
    }

    res.clearCookie("loginToken")

    await tokenBlackListModel.create({
        token: token
    })

    res.status(200)
        .json({
            message: "user logout successfully"
        })
}

export { registerUser, loginUser, logoutUser }