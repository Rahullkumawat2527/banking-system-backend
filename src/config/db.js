import mongoose from "mongoose";

async function connectDB() {
    try {

        await mongoose.connect(process.env.MONGO_URI)
        console.log("database is successfully connected")

    } catch (error) {
        console.log("database connection failed")
        process.exit(1)
    }
}


export default connectDB