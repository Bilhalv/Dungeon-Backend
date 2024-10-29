import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const router = Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ erro: "Informe name, email e senha" });
    return;
  }

  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashPassword,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
