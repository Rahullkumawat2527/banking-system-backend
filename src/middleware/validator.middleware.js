import { body, validationResult } from "express-validator"


async function validateResult(req, res, next) {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        return res.status(422)
            .json({
                success: false,
                message: "Validation failed",
                errors: error.array()
            })
    }

    next()
}

// register validationrules
const registerUserValidationRules = [
    body("username")
        .notEmpty()
        .withMessage("username is required")
        .isString()
        .withMessage("username must be string")
        .isLength({ min: 3, max: 20 })
        .withMessage("username must be between 3 and 20 characters"),

    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
        .withMessage("Email format is invalid"),

    body("password")
        .exists()
        .withMessage("password is required")
        .isLength({ min: 6 })
        .withMessage("password must be greater than 6 chracters"),
    validateResult




]

// Login validation rules
const loginUserValidationRules = [
    // Custom validation to check if either email or username is provided
    body()
        .custom((value, { req }) => {
            const { email, username, password } = req.body

            // Check if at least email or username is provided
            if (!email && !username) {
                throw new Error("Either email or username is required")
            }

            // Check if password is provided
            if (!password) {
                throw new Error("Password is required")
            }

            return true
        }),

    // Email validation (if provided)
    body("email")
        .optional()
        .isEmail()
        .withMessage("Please provide a valid email address")
        .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)
        .withMessage("Email format is invalid")
        .normalizeEmail()
        .trim(),

    // Username validation (if provided)
    body("username")
        .optional()
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3, max: 20 })
        .withMessage("Username must be between 3 and 20 characters")
        .trim()
        .toLowerCase(),

    // Password validation
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password must be a string")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    validateResult  // Run validation result middleware
]

const transactionValidationRules = [
    body("fromAccount")
        .notEmpty()
        .withMessage("fromAccount is required")
        .isString()
        .withMessage("fromAccount must be string"),

    body("toAccount")
        .notEmpty()
        .withMessage("toAccount is required")
        .isString()
        .withMessage("toAccount must be string"),

    body("amount")
        .notEmpty()
        .withMessage("transaction amount is required")
        .isNumeric()
        .withMessage("transaction amount must be number")
        .custom(value => {
            if (value < 1) {
                throw new Error('Price must be atleast 1')
            }
            return true
        }),

    body("idempotencyKey")
        .notEmpty()
        .withMessage("idempotencyKey is required")
        .isString()
        .withMessage("idempotencyKey must be string"),
    validateResult


]

const initialFundsTransactionRules = [
    body("toAccount")
        .notEmpty()
        .withMessage("toAccount is required")
        .isString()
        .withMessage("toAccount must be string"),

    body("amount")
        .notEmpty()
        .withMessage("transaction amount is required")
        .isNumeric()
        .withMessage("transaction amount must be number")
        .custom(value => {
            if (value < 1) {
                throw new Error('Price must be atleast 1')
            }
            return true
        }),

    body("idempotencyKey")
        .notEmpty()
        .withMessage("idempotencyKey is required")
        .isString()
        .withMessage("idempotencyKey must be string"),
    validateResult


]

export { registerUserValidationRules, loginUserValidationRules, transactionValidationRules,initialFundsTransactionRules }