const email = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    account: process.env.EMAIL_ACCOUNT,
    password: process.env.PASSWORD,
    subject: process.env.SUBJECT,
}

export default email