import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
const router = Router();

router.get("/", async (req, res) => {
  try {
    const foods = await prisma.foods.findMany();
    res.status(200).json(foods);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const foods = await prisma.foods.findMany(
      {
        where: { id: req.params.id },
      }
    );
    res.status(200).json(foods);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/search/:name", async (req, res) => {
  try {
    const foods = await prisma.foods.findMany(
      {
        where: { name: { contains: req.params.name, mode: "insensitive" } },
      }
    );
    res.status(200).json(foods);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/", async (req, res) => {
  const { name, description, price, img } = req.body;

  if (!name || !description || !price || !img) {
    res.status(400).json({
      erro: "Informe name, description, price e img",
    });
    return;
  }

  try {
    const food = await prisma.foods.create({
      data: { name, description, price, img },
    });
    res.status(201).json(food);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const food = await prisma.foods.delete({
      where: { id: id },
    });
    res.status(200).json(food);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, img } = req.body;

  if (![name, description, price, img].length) {
    res.status(400).json({ erro: "Informe pelo menos um campo" });
    return;
  }

  try {
    const food = await prisma.foods.update({
      where: { id: id },
      data: {
        name: name ?? name,
        description: description ?? description,
        price: price ?? price,
        img: img ?? img,
      },
    });
    res.status(200).json(food);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
