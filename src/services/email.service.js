import dotenv from "dotenv"
dotenv.config()
import nodemailer from "nodemailer"




const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD

    },
    pool: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
})


transporter.verify((error, success) => {



    if (error) {
        console.error("Error while connecting to email service", error)
    } else {
        console.log('Email server is ready to send messages');
    }
})


// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"rahul's banking system and sended by" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        });

        // console.log('Message sent: %s', info.messageId);
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));


        // return info
    } catch (error) {
        console.error('Error sending email:', error);
        throw error
    }
}


async function sendVerificationEmail(userEmail, name) {
    const subject = 'Thank You for making transaction through rahuls banking system'
    const text = `Hello ${name}, \n\n Thank You for registering at rahul's banking system.
    we are excited to have you on board! \n\n Best regards, \nthe rahul's banking system`
    const html = `<p>Hello ${name},</p><p>Thank you for registering at rahul's banking system .we are excited to have you onboard </p><p>Best regards,<br> the rahul's backend team</p>`

    await sendEmail(userEmail, subject, text, html)
}


async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = 'Amount transfer'
    const text = `Hello ${name}, 
     Thank You for making transaction at rahul's banking system`
    const html = `<p>Hello ${name},</p><p>Thank you for making transaction at rahul's banking system</p><p>a payment of amount ${amount} to the account id : ${toAccount} have been registered successfully<br> the rahul's backend team</p>`

    await sendEmail(userEmail, name, amount, toAccount)

}
export { sendVerificationEmail, sendTransactionEmail }
