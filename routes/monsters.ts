import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
const router = Router();

async function formatMonster(id: string) {
  const monster = await prisma.monsters.findUnique({
    where: { id },
  });

  const foodsOnMonsters = await prisma.monstersOnFoods.findMany({
    where: { monster_id: id },
  });

  const foods = await prisma.foods.findMany({
    where: { id: { in: foodsOnMonsters.map((f) => f.food_id) } },
    select: {
      id: true,
      name: true,
      img: true,
    },
  });

  return { ...monster, foods: foods };
}

router.get("/", async (req, res) => {
  try {
    const monsters = await prisma.monsters.findMany();
    const results = await Promise.all(monsters.map((m) => formatMonster(m.id)));
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const monsters = await formatMonster(req.params.id);
    res.status(200).json(monsters);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/", async (req, res) => {
  const { name, desc, img } = req.body;

  if (!name || !desc || !img) {
    res.status(400).json({
      erro: "Informe name, desc e img",
    });
    return;
  }

  try {
    const monsters = await prisma.monsters.create({
      data: { name, desc, img },
    });
    res.status(201).json(monsters);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const monsters = await prisma.monsters.delete({
      where: { id: id },
    });
    res.status(200).json(monsters);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, desc, img } = req.body;

  if (![name, desc, img].length) {
    res.status(400).json({ erro: "Informe pelo menos um campo" });
    return;
  }

  try {
    const monsters = await prisma.monsters.update({
      where: { id: id },
      data: {
        name: name ?? name,
        desc: desc ?? desc,
        img: img ?? img,
      },
    });
    res.status(200).json(monsters);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
