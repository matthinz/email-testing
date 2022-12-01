import nodemailer from "nodemailer";
import { uploadEmailTemplate } from "./deploy";

run(process.argv.slice(2)).catch((err) => {
  process.exitCode = 1;
  console.error(err);
});

async function run(params: string[]): Promise<void> {
  const bucket = process.env.S3_BUCKET;
  const dir = [
    "litmus",
    new Date().toISOString().replace(/(:|-|\.\d+Z$)/g, ""),
  ].join("/");

  if (!bucket) {
    throw new Error("S3_BUCKET is not set!");
  }

  if (!process.env.LITMUS_EMAIL) {
    throw new Error("LITMUS_EMAIL is not set");
  }

  const { html } = await uploadEmailTemplate(params[0], bucket, dir);

  const host = process.env.SMTP_HOST ?? "localhost";
  let port: number;

  if (process.env.SMTP_PORT) {
    port = parseInt(process.env.SMTP_PORT, 10);
    if (isNaN(port)) {
      throw new Error("SMTP_PORT is invalid");
    }
  } else {
    port = 25;
  }

  const transport = nodemailer.createTransport({
    host,
    port,
  });

  transport.sendMail({
    to: process.env.LITMUS_EMAIL,
    from: "test@example.org",
    subject: "Testing",
    html,
  });
}
