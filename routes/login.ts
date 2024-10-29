import bcrypt from "bcrypt";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ erro: "Informe email e senha" });
    return;
  }

  const user = await prisma.users.findUnique({ where: { email } });

  if (!user) {
    res.status(404).json({ erro: "Usuário não encontrado" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401).json({ erro: "Senha incorreta" });
    return;
  }

  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY!, {
    expiresIn: "1h",
  });

  res.json({ token });
});


export default router;
