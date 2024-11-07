import bcrypt from "bcrypt";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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
  } else {
    res.status(200).json({
      id: user.id,
    });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ erro: "Informe id" });
    return;
  }
  const user = await prisma.users.findUnique({ where: { id: id } });

  if (!user) {
    res.status(404).json({ erro: "Usuário nao encontrado" });
    return;
  } else {
    res.status(200).json(user);
    return;
  }
});

export default router;
