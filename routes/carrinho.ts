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
    const carrinho = await prisma.carrinhos.findFirst({
      where: { user_id: req.params.id, sold: false },
      include: { items: true },
    });
    res.status(200).json(carrinho);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/", async (req, res) => {
  const { user_id, items = [] } = req.body;

  if (!user_id) {
    res.status(400).json({ erro: "Informe user_id" });
    return;
  }
  const total = items.reduce(
    (acc: number, item: { price: number; quantity: number }) => {
      return acc + item.price * item.quantity;
    },
    0
  );

  try {
    const carrinho = await prisma.carrinhos.create({
      data: {
        user_id,
        total: total,
        sold: false,
        items: {
          createMany: {
            data: items.map((item: { food_id: any; quantity: any }) => ({
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

router.post("/:id/items", async (req, res) => {
  const { id } = req.params;
  const { id_food, price } = req.body;

  if (!id_food || !price) {
    res.status(400).json({ erro: "Informe id_food e price os campos." });
    return;
  }

  try {
    // check if there is already an item
    const getCarrinho = await prisma.carrinhos.findFirst({
      where: {
        user_id: id,
      },
    });
    const findExistingItem = await prisma.produtos.findFirst({
      where: {
        id_carrinho: getCarrinho?.id ?? "",
        id_food: id_food,
      },
    });

    if (findExistingItem) {
      // update the existing item
      const updatedItem = await prisma.produtos.update({
        where: {
          id: findExistingItem.id,
        },
        data: {
          amount: findExistingItem.amount + 1,
        },
      });
      res.status(200).json(updatedItem);
    } else {
      const newItem = await prisma.produtos.create({
        data: {
          id_carrinho: id,
          id_food: id_food,
          price: price,
          amount: 1,
        },
      });
      res.status(201).json(newItem);
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/:id/items/:foodID", async (req, res) => {
  const { id, foodID } = req.params;

  const findID = await prisma.produtos.findFirst({
    where: {
      id_carrinho: id,
      id_food: foodID,
    },
  });

  if (!findID) {
    res.status(400).json({ erro: "Item não encontrado" });
    return;
  }

  try {
    if (findID.amount > 1) {
      const updatedItem = await prisma.produtos.update({
        where: {
          id: findID.id,
        },
        data: {
          amount: findID.amount - 1,
        },
      });
      res.status(200).json(updatedItem);
      return;
    } else {
      const item = await prisma.produtos.delete({
        where: {
          id: findID.id,
        },
      });
      res.status(200).json(item);
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
