
const { exec } = require('child_process');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const emailAddress:string = process.env.EMAIL_ADDRESS!

const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASS
    }
});


const sendEmail = async(text:string) =>  {
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: `no-reply@project4.io`, // sender address
        to: emailAddress!.split(','), // list of receivers
        subject: `Medicover appointment available`, // Subject line
        text: `Medicover appointment available`, // plain text body
        html: text.replaceAll('\n','<br />'), // html body
    });

    console.log("Message sent: %s", info.messageId);
}

const sleep = (ms:number) => new Promise(r => setTimeout(r, ms));

const checkAppointment = async (command:string):Promise<string | undefined> => await new Promise((resolve) => {
    return exec(command, (errorL:any, stdout:any, stderr:any) => {
        if(stdout.includes('Date: ')){
            return resolve(stdout);
        }
        if (stderr) {
            console.log(stderr);
        }
        if(stdout) {
            console.log(stdout);
        }
        return resolve(undefined);
    });
});

const commands:string[] = [process.env.MEDIHUNTER_RUN_COMMAND!, process.env.MEDIHUNTER_RUN_COMMAND_2!]


let counter = 0;
(async ()=>{
    while(true){
        for await (const command of commands){
            const appointments = await checkAppointment(command);
            if(appointments){
                await sendEmail(appointments).catch(console.error);
                await sleep(1000 * 60 * 2)
            }
            counter++;
            console.log(`Try number ${counter} finished`);
            await sleep(1000 * 15)
        }
        await sleep(1000 * 90)
    }
})()

