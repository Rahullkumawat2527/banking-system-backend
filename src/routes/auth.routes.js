import express from "express"
import { loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js"
import { registerUserValidationRules,loginUserValidationRules} from "../middleware/validator.middleware.js"
import upload from "../middleware/multer.middleware.js"

const router = express.Router()


router.post("/register", upload.none(), registerUserValidationRules, registerUser)
router.post("/login",upload.none(),loginUserValidationRules,loginUser)


router.post("/logout",logoutUser)



export default router 