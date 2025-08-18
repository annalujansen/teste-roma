-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cliente" (
    "telefone" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "endereco" TEXT NOT NULL,
    "local_id" INTEGER NOT NULL,
    CONSTRAINT "Cliente_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "Local" ("local_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pedido" (
    "pedido_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "telefone_cliente" TEXT NOT NULL,
    "data_hora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "local_id" INTEGER NOT NULL,
    "observacao" TEXT,
    "turno" TEXT NOT NULL,
    "forma_pagamento" TEXT NOT NULL DEFAULT 'cartao',
    "endereco" TEXT NOT NULL,
    CONSTRAINT "Pedido_telefone_cliente_fkey" FOREIGN KEY ("telefone_cliente") REFERENCES "Cliente" ("telefone") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pedido_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "Local" ("local_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PedidoCardapio" (
    "pedido_id" INTEGER NOT NULL,
    "codigo_item" TEXT NOT NULL,
    "observacao" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY ("pedido_id", "codigo_item"),
    CONSTRAINT "PedidoCardapio_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "Pedido" ("pedido_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PedidoCardapio_codigo_item_fkey" FOREIGN KEY ("codigo_item") REFERENCES "Item" ("codigo_item") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Item" (
    "codigo_item" TEXT NOT NULL PRIMARY KEY,
    "nome_item" TEXT NOT NULL,
    "preco" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Local" (
    "local_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bairro" TEXT NOT NULL,
    "taxa" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Variavel" (
    "nome" TEXT NOT NULL PRIMARY KEY,
    "valor" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Post_name_idx" ON "Post"("name");
