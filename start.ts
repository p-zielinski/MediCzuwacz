
import { exec } from "node:child_process";
import * as nodemailer from "nodemailer"
import * as dotenv from "dotenv";
dotenv.config();

const emailAddress = process.env.EMAIL_ADDRESS

const transporter = nodemailer.createTransport({
    host: "smtppro.zoho.com",
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASSWORD,
    },
    port: 587,
    tls: {
        rejectUnauthorized: true,
        minVersion: "TLSv1.2"
    }
});


const sendEmail = async(text) =>  {
    console.log({
        from: `"${emailAddress}" <${emailAddress}>`, // sender address
        to: emailAddress!.split(','), // list of receivers
        subject: `Medicover appointment available`, // Subject line
        text: `Medicover appointment available`, // plain text body
        html: text.replaceAll('\n','<br />'), // html body
    })
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: `"${emailAddress}" <${emailAddress}>`, // sender address
        to: emailAddress!.split(','), // list of receivers
        subject: `Medicover appointment available`, // Subject line
        text: `Medicover appointment available`, // plain text body
        html: text.replaceAll('\n','<br />'), // html body
    });

    console.log("Message sent: %s", info.messageId);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

const checkAppointment = async () => await new Promise((resolve) => {
    return exec(process.env.MEDIHUNTER_RUN_COMMAND, (error, stdout, stderr) => {
        if(stdout.includes('Date: ')){
            return resolve(stdout);
        }
        if (stderr) {
            console.log(stderr);
        }
        return resolve(undefined);
    });
});


(async ()=>{
    while(true){
        const appointments = 'xxxx'//await checkAppointment();
        if(appointments){
            await sendEmail(appointments).catch(console.error);
            await sleep(1000 * 90)
        }
        await sleep(1000 * 90)
    }
})()

