import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ erro: "Informe email" });
    return;
  }

  const user = await prisma.users.findUnique({ where: { email } });

  if (!user) {
    res.status(404).json({ erro: "Usuário não encontrado" });
    return;
  }

  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY!, {
    expiresIn: "1h",
  });

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "your-email@gmail.com",
      pass: "your-password",
    },
  });

  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Recupera o de Senha",
    text: `Olá, ${user.name}! Clique no link abaixo para recuperar sua senha:\n\n
    http://localhost:3000/recovery?token=${token}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email de recuperação enviado com sucesso!" });
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
