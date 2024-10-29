import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
const router = Router();

router.get("/", async (req, res) => {
  try {
    const carrinhos = await prisma.carrinhos.findMany();
    res.status(200).json(carrinhos);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const carrinho = await prisma.carrinhos.findUnique({
      where: { id: req.params.id },
    });
    res.status(200).json(carrinho);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/", async (req, res) => {
  const { user_id, items } = req.body;

  if (!user_id) {
    res.status(400).json({ erro: "Informe user_id" });
    return;
  }
  const total = items.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  });

  try {
    const carrinho = await prisma.carrinhos.create({
      data: {
        user_id,
        total: total,
        sold: false,
        items: {
          createMany: {
            data: items.map((item) => ({
              food_id: item.food_id,
              quantity: item.quantity,
            })),
          },
        },
      },
    });
    res.status(201).json(carrinho);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const carrinho = await prisma.carrinhos.delete({
      where: { id },
    });
    res.status(200).json(carrinho);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { items, sold = false } = req.body;

  if (!items || !items.length || !sold) {
    res.status(400).json({ erro: "Informe pelo menos um item." });
    return;
  }

  const previousTotal = await prisma.carrinhos.findUnique({
    where: { id },
    select: { total: true },
  });

  var total = items.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  });

  total += previousTotal?.total ?? 0;

  try {
    const carrinho = await prisma.carrinhos.update({
      where: { id },
      data: {
        total,
        sold,
        items: {
          upsert: items.map((item) => ({
            where: {
              food_id_carrinho_id: {
                food_id: item.food_id,
                carrinho_id: id,
              },
            },
            create: {
              food_id: item.food_id,
              quantity: item.quantity,
            },
            update: {
              quantity: {
                increment: item.quantity,
              },
            },
          })),
        },
      },
    });
    res.status(200).json(carrinho);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
