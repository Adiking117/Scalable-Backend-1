import express from "express";
import { Queue } from "bullmq";
import { addUserToCourseQuery } from "./utils/course.js";
import dotenv from 'dotenv'
import cors from 'cors'

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(cors());
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true , limit:"16kb"}))
dotenv.config();

const emailQueue = new Queue("email-queue", {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD
  }
});

app.get("/", (req, res) => {
  return res.json({ status: "success", message: "Hello from Express Server" });
});

app.post("/addUserToCourse", async (req, res) => {
  const { from, to, subject, body } = req.body;
  // Critical
  await addUserToCourseQuery();

  // Non Critical
  await emailQueue.add(`${Date.now()}`, {
    from: from,
    to: to,
    subject: subject,
    body: body,
  },
  { 
    delay: 1000 
  });

  return res.json({ status: "success", data: { message: "Email Sent Successfully" } });
});

app.listen(PORT, () => console.log(`Express Server Started on PORT:${PORT}`));