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
  const { items } = req.body;

  type item = {
    id_food: string;
    amount: number;
    price: string;
  };

  if (!items) {
    res.status(400).json({ erro: "Informe pelo menos um item." });
    return;
  }

  const previousTotal = await prisma.carrinhos.findUnique({
    where: { id },
    select: { total: true },
  });

  var total: number = items.reduce((acc: number, item: item) => {
    const price = parseFloat(item.price.replace(",", "."));
    return acc + price * item.amount;
  }, 0);

  total += parseFloat((previousTotal?.total ?? "0").toString());

  try {
    for (const item of items) {
      const produto = await prisma.produtos.findFirst({
        where: {
          id_carrinho: id,
          id_food: item.food_id,
        },
      });

      if (!produto) {
        await prisma.carrinhos.update({
          where: { id },
          data: {
            total: total,
            items: {
              createMany: {
                data: [
                  {
                    id_carrinho: id,
                    id_food: item.id_food,
                    amount: item.amount,
                    price: item.price,
                  },
                ],
              },
            },
          },
        });
      } else {
        await prisma.produtos.update({
          where: { id: produto.id },
          data: {
            amount: produto.amount + item.amount,
          },
        });
      }
    }

    const carrinho = await prisma.carrinhos.update({
      where: { id },
      data: {
        total,
      },
    });
    res.status(200).json(carrinho);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/:id/items/:itemId", async (req, res) => {
  const { id, itemId } = req.params;

  try {
    const item = await prisma.produtos.delete({
      where: {
        id: itemId,
      },
    });

    res.status(200).json(item);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
