import dotenv from "dotenv"
const result = dotenv.config()
import app from "./src/app.js"
import connectDB from "./src/config/db.js"

if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
}


const envVariables = ['MONGO_URI','JWT_SECRET','PORT','EMAIL_USER','CLIENT_ID','CLIENT_SECRET','REFRESH_TOKEN','ACCESS_TOKEN','EMAIL_APP_PASSWORD']

const missingEnvVariables = envVariables.filter((envvar) => !process.env[envvar])

if(missingEnvVariables.length > 0){
    console.error("missing required environment variables",missingEnvVariables.join(', '))
    process.exit(1)
}



connectDB()

app.listen(process.env.PORT, (req, res) => {
    console.log("server is running on port 8000")
})