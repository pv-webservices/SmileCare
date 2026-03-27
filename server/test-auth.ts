import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

async function testGmail() {
    try {
        console.log('Testing GMAIL_USER:', process.env.GMAIL_USER);
        console.log('Testing GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'PRESENT' : 'MISSING');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ''), // test with spaces removed
            },
        });

        const info = await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            subject: 'Test connection',
            text: 'It works!'
        });
        
        console.log('SUCCESS! Email sent:', info.response);
    } catch(err) {
        console.error('FAILED!', err);
    }
}

testGmail();
