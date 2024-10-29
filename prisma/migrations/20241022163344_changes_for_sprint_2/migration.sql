/*
  Warnings:

  - You are about to drop the `user_on_food` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `desc` to the `monster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `img` to the `monster` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_on_food" DROP CONSTRAINT "user_on_food_food_id_fkey";

-- DropForeignKey
ALTER TABLE "user_on_food" DROP CONSTRAINT "user_on_food_user_id_fkey";

-- AlterTable
ALTER TABLE "monster" ADD COLUMN     "desc" TEXT NOT NULL,
ADD COLUMN     "img" TEXT NOT NULL;

-- DropTable
DROP TABLE "user_on_food";

-- CreateTable
CREATE TABLE "produto" (
    "id" TEXT NOT NULL,
    "id_food" TEXT NOT NULL,
    "id_carrinho" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "carrinhosId" TEXT,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrinho" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,
    "sold" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "carrinho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrinhosonFood" (
    "id" TEXT NOT NULL,
    "food_id" TEXT NOT NULL,
    "carrinho_id" TEXT NOT NULL,

    CONSTRAINT "CarrinhosonFood_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_carrinhosId_fkey" FOREIGN KEY ("carrinhosId") REFERENCES "carrinho"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrinhosonFood" ADD CONSTRAINT "CarrinhosonFood_carrinho_id_fkey" FOREIGN KEY ("carrinho_id") REFERENCES "carrinho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrinhosonFood" ADD CONSTRAINT "CarrinhosonFood_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
