import bcrypt from "bcrypt";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const prisma = new PrismaClient();
const router = Router();

router.post("/:id", async (req, res) => {
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
    await prisma.users.update({
      where: { id: id },
      data: {
        admin: !user.admin,
      },
    });
    res.status(200).json(user);
    return;
  }
});

router.get("/", async (req, res) => {
  const users = await prisma.users.findMany({
    where: {
      admin: true,
    },
  });
  res.status(200).json(users);
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
  }
  res.status(200).json(user.admin);
})

export default router;
