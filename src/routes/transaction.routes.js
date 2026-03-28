import express from "express"
import {authMiddleware, authSystemUserMiddleware} from "../middleware/auth.middleware.js"
import { createInitialFundsTransaction, createTransaction } from "../controllers/transaction.controller.js"
import upload from "../middleware/multer.middleware.js"
import { initialFundsTransactionRules, transactionValidationRules } from "../middleware/validator.middleware.js"

const router = express.Router()

router.post("/", upload.none(), authMiddleware, transactionValidationRules, createTransaction)

// POST /api/transactions/system/initial-funds
// create initail fund transaction from system user
router.post("/system/initial-funds",upload.none(),authSystemUserMiddleware,initialFundsTransactionRules,createInitialFundsTransaction)

export default router