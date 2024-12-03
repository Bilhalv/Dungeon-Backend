-- CreateTable
CREATE TABLE "food" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "img" TEXT NOT NULL,

    CONSTRAINT "food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "img" TEXT NOT NULL,

    CONSTRAINT "monster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster_on_food" (
    "id" TEXT NOT NULL,
    "food_id" TEXT NOT NULL,
    "monster_id" TEXT NOT NULL,

    CONSTRAINT "monster_on_food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produto" (
    "id" TEXT NOT NULL,
    "id_food" TEXT NOT NULL,
    "id_carrinho" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrinho" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sold" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "carrinho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "recovery" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "monster_on_food" ADD CONSTRAINT "monster_on_food_monster_id_fkey" FOREIGN KEY ("monster_id") REFERENCES "monster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_on_food" ADD CONSTRAINT "monster_on_food_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_id_carrinho_fkey" FOREIGN KEY ("id_carrinho") REFERENCES "carrinho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_id_food_fkey" FOREIGN KEY ("id_food") REFERENCES "food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrinho" ADD CONSTRAINT "carrinho_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
