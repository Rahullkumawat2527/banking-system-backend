import express from "express"
import cookieParser from "cookie-parser"
import authRouter from "../src/routes/auth.routes.js"
import accountRouter from "../src/routes/account.routes.js"
import transactionRouter from "./routes/transaction.routes.js"



const app = express()

app.use(express.json())

app.use(cookieParser())

// auth prefix
app.use("/api/auth", authRouter)

// account prefix 
app.use("/api/accounts",accountRouter)

// transaction prefix
app.use("/api/transactions",transactionRouter)

export default app