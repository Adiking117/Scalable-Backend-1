import { Worker } from "bullmq";

import dotenv from 'dotenv'

dotenv.config();

export async function mockSendEmail(payload) {
    const { from, to, subject, body } = payload;
    return new Promise((resolve, reject) => {
      console.log(`Sending Email to ${to}....`);
      setTimeout(() => resolve(1), 2 * 1000);
    });
}
  
const emailWorker = new Worker("email-queue",async(job)=>{
    const data = job.data
    await mockSendEmail({
        from:data.from,
        to:data.to,
        subject:data.subject,
        body:data.body
    })
},
{
    connection: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD
    },
    // concurrency:10,
    limiter:{
        max:50,
        duration:10*1000
    }
})

export {
    emailWorker
}