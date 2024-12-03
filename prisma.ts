import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient().$extends({
  name: "MyPrisma",
  model: {
    cart: {
      update: {
        items: {
          create: {
            quantity: {
              default: 1,
            },
          },
        },
        total: {
          default: 0,
          set: async (val: any, { data }: any, { parent }: any) => {
            const total = parent.total + data.price * data.quantity;
            return total;
          },
        },
      },
    },
  },
});

