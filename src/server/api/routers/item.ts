import { db } from "~/server/db";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export interface ItemType {
  codigo_item: string;
  nome_item: string;
  preco: number;
}

const createItemInput = z.object({
  codigo_item: z.string().min(1, "Código do item é obrigatório"),
  nome_item: z.string().min(1, "Nome do item é obrigatório"),
  preco: z.number().positive("Preço deve ser positivo"),
});

const updateItemInput = z.object({
  codigo_item: z.string().min(1),
  nome_item: z.string().min(1).optional(),
  preco: z.number().positive().optional(),
});

const itemInput = z.object({
  codigo_item: z.string().min(1),
});

export const itemsRouter = createTRPCRouter({
  getItemById: publicProcedure
    .input(itemInput)
    .query(async ({ input }) => {
      const item = await db.item.findUnique({
        where: { codigo_item: input.codigo_item },
      });

      if (!item) throw new Error("Item não encontrado");
      return item as ItemType;
    }),

  getAllItems: publicProcedure.query(async () => {
    const items = await db.item.findMany();
    return items as ItemType[];
  }),

  createItem: publicProcedure
    .input(createItemInput)
    .mutation(async ({ input }) => {
      const itemExistente = await db.item.findUnique({
        where: { codigo_item: input.codigo_item },
      });

      if (itemExistente) throw new Error("Item já existe");

      const itemCriado = await db.item.create({
        data: input,
      });

      if (!itemCriado) throw new Error("Erro ao criar item");
      return itemCriado as ItemType;
    }),

  updateItem: publicProcedure
    .input(updateItemInput)
    .mutation(async ({ input }) => {
      const { codigo_item, ...data } = input;

      const itemExistente = await db.item.findUnique({
        where: { codigo_item },
      });

      if (!itemExistente) throw new Error("Item não encontrado");

      const itemAtualizado = await db.item.update({
        where: { codigo_item },
        data,
      });

      if (!itemAtualizado) throw new Error("Erro ao atualizar item");
      return itemAtualizado as ItemType;
    }),

  deleteItem: publicProcedure
    .input(itemInput)
    .mutation(async ({ input }) => {
      const itemExistente = await db.item.findUnique({
        where: { codigo_item: input.codigo_item },
      });

      if (!itemExistente) throw new Error("Item não encontrado");

      const itemDeletado = await db.item.delete({
        where: { codigo_item: input.codigo_item },
      });

      if (!itemDeletado) throw new Error("Erro ao deletar item");
      return itemDeletado as ItemType;
    }),
});