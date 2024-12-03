/**
 * This route handles the logic for managing a user's cart.
 */
import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
const router = Router();

/**
 * Get all carts
 */
router.get("/", async (req, res) => {
  try {
    const carrinhos = await prisma.cart.findMany();
    res.status(200).json(carrinhos);
  } catch (error) {
    res.status(400).json(error);
  }
});

/**
 * Get a cart by user id
 */
router.get("/:id", async (req, res) => {
  try {
    const carrinho = await prisma.cart.findFirst({
      where: { user_id: req.params.id, sold: false },
      include: { items: true },
    });
    res.status(200).json(carrinho);
  } catch (error) {
    res.status(400).json(error);
  }
});

/**
 * Create a new cart
 */
router.post("/", async (req, res) => {
  const { user_id, items = [] } = req.body;

  if (!user_id) {
    res.status(400).json({ erro: "Informe user_id" });
    return;
  }

  //checking if the user already has a cart
  const cart = await prisma.cart.findFirst({
    where: { user_id, sold: false },
  });

  if (cart) {
    res.status(400).json({ erro: "O usuário já possui um carrinho" });
    return;
  }

  try {
    const carrinho = await prisma.cart.create({
      data: {
        user_id,
        items: {
          create: items,
        },
      },
    });
    res.status(201).json(carrinho);
  } catch (error) {
    res.status(400).json(error);
  }
});

/**
 * Delete a cart by id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const carrinho = await prisma.cart.delete({
      where: { id },
    });
    res.status(200).json(carrinho);
  } catch (error) {
    res.status(400).json(error);
  }
});

/**
 * Add a new item to a cart
 */
router.post("/:idUser/items", async (req, res) => {
  const { idUser } = req.params;
  const { id_food, price } = req.body;

  // Validação de entrada
  if (typeof id_food !== "string" || typeof price !== "number" || price <= 0) {
    return res.status(400).json({ erro: "Informe id_food e price válidos." });
  }

  try {
    // Buscar ou validar o carrinho do usuário
    const cart = await prisma.cart.findFirst({
      where: { user_id: idUser, sold: false },
    });

    if (!cart) {
      return res.status(400).json({ erro: "Carrinho não encontrado." });
    }

    // Buscar o item no carrinho
    const existingItem = await prisma.foodCart.findFirst({
      where: {
        id_cart: cart.id,
        id_food,
      },
    });

    if (existingItem) {
      // Atualizar a quantidade do item existente
      await prisma.foodCart.update({
        where: { id: existingItem.id },
        data: { amount: existingItem.amount + 1 },
      });
    } else {
      // Criar um novo item no carrinho
      await prisma.foodCart.create({
        data: {
          id_cart: cart.id,
          id_food,
          price,
          amount: 1,
        },
      });
    }

    // Recalcular o total do carrinho considerando quantidade (amount)
    const updatedTotal = await prisma.foodCart
      .findMany({
        where: { id_cart: cart.id },
        select: {
          price: true,
          amount: true,
        },
      })
      .then((items) =>
        items.reduce(
          (total, item) => total + Number(item.price) * item.amount,
          0
        )
      );

    // Atualizar o total no carrinho
    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: { total: updatedTotal },
      include: { items: true },
    });

    return res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Erro ao adicionar item ao carrinho:", error);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

/**
 * Delete an item from a cart
 */
router.delete("/:idUser/items/:foodID", async (req, res) => {
  const { idUser, foodID } = req.params;

  try {
    // Buscar o carrinho do usuário
    const cart = await prisma.cart.findFirst({
      where: {
        user_id: idUser,
        sold: false,
      },
    });

    if (!cart) {
      return res.status(400).json({ erro: "Usuário não possui um carrinho." });
    }

    // Buscar o item no carrinho
    const findItem = await prisma.foodCart.findFirst({
      where: {
        id_cart: cart.id,
        id_food: foodID,
      },
    });

    if (!findItem) {
      return res.status(400).json({ erro: "Item não encontrado no carrinho." });
    }

    // Decrementar a quantidade ou remover o item
    if (findItem.amount > 1) {
      await prisma.foodCart.update({
        where: { id: findItem.id },
        data: { amount: findItem.amount - 1 },
      });
    } else {
      await prisma.foodCart.delete({
        where: { id: findItem.id },
      });
    }

    // Recalcular o total do carrinho considerando quantidade (amount)
    const updatedTotal = await prisma.foodCart
      .findMany({
        where: { id_cart: cart.id },
        select: {
          price: true,
          amount: true,
        },
      })
      .then((items) =>
        items.reduce(
          (total, item) => total + Number(item.price) * item.amount,
          0
        )
      );

    // Atualizar o total no carrinho
    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: { total: updatedTotal },
      include: { items: true },
    });

    return res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Erro ao remover item do carrinho:", error);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

export default router;
