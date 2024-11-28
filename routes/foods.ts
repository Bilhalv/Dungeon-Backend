import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { Request, Response } from "express-serve-static-core";
import { ParsedQs } from "qs";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
const router = Router();

async function formatFood(id: string) {
  try {
    const food = await prisma.foods.findFirst({ where: { id } });

    if (!food) {
      return { erro: "Refeição não encontrada" };
    }

    const carrinhosSoldAmt = await prisma.carrinhos.count({
      where: { sold: true },
    });
    const carrinhosPendingAmt = await prisma.carrinhos.count({
      where: { sold: false },
    });

    const monstersOnFood = await prisma.monstersOnFoods.findMany({
      where: { food_id: food.id },
    });
    const monsters = await prisma.monsters.findMany({
      where: { id: { in: monstersOnFood.map((m) => m.monster_id) } },
    });

    return {
      ...food,
      carrinhosSold: carrinhosSoldAmt,
      carrinhosPending: carrinhosPendingAmt,
      monsters,
    };
  } catch (error) {
    return { erro: "Erro ao formatar refei o" };
  }
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const foods = await prisma.foods.findMany();
    const results = await Promise.all(foods.map((f) => formatFood(f.id)));
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    res.status(200).json(await formatFood(req.params.id));
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/search/:name", async (req, res) => {
  try {
    const foods = await prisma.foods.findMany({
      where: { name: { contains: req.params.name, mode: "insensitive" } },
    });

    const results = await Promise.all(foods.map((f) => formatFood(f.id)));

    res.status(200).json(results);
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
