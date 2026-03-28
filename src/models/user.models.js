import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "email is required"],
        trim: true,
        unique: [true, "email already exist"],
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address"]
    },
    username: {
        type: String,
        required: [true, "name is required for creating an account"]
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "password should be greater than 6 characters"],
        select: false // ki jabb bhi user ka data find karenge to password nhi dikhega ye command ye kaam kar rhi thi
    },
    systemUser: {
        type: Boolean,
        default: false,
        immutable: false,
        select: false
    }
}, { timestamps: true })


// checking whether user password is modified or not before saving

userSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password")) {
            return next
        }
        const hash = await bcrypt.hash(this.password, 10)
        this.password = hash
        return next
    } catch (error) {
        next(error)
    }

})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const userModel = mongoose.model("user", userSchema)

export default userModel