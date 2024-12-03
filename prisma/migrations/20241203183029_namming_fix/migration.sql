/*
  Warnings:

  - You are about to drop the column `id_carrinho` on the `produto` table. All the data in the column will be lost.
  - Added the required column `id_cart` to the `produto` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "produto" DROP CONSTRAINT "produto_id_carrinho_fkey";

-- AlterTable
ALTER TABLE "produto" DROP COLUMN "id_carrinho",
ADD COLUMN     "id_cart" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_id_cart_fkey" FOREIGN KEY ("id_cart") REFERENCES "carrinho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
