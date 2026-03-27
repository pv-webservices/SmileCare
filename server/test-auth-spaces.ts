import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

async function testGmail() {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD, // WITH spaces
            },
        });

        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            subject: 'Test connection with spaces',
            text: 'It works!'
        });
        
        console.log('SUCCESS! Email sent:', info.response);
    } catch(err) {
        console.error('FAILED!', err);
    }
}

testGmail();
