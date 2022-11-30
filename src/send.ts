import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
});

transport.sendMail({
  to: "matt@matthinz.com",
  from: "test@example.org",
  text: "Hi there",
});
