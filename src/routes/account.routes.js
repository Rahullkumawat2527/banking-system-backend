import express from "express"
import {authMiddleware} from "../middleware/auth.middleware.js"
import { createAccount, getUserAccountBalance, getUserAccounts } from "../controllers/account.controller.js"

const router = express.Router()

// POST /api/account
// create a new account
// protected route
router.post("/", authMiddleware, createAccount)

// GET /api/accounts/
// GET all accounts of the logged-in-user
// Protected Route
router.get("/",authMiddleware,getUserAccounts)


// GET /api/account/balance/:accountId
// GET account balance
router.get("/balance/:accountId",authMiddleware,getUserAccountBalance)

export default router