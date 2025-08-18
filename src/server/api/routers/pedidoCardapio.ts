import { db } from "~/server/db";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export interface PedidoCardapioType {
  pedido_id: number;
  codigo_item: string;
  quantidade: number;
  observacao?: string;
}

const createPedidoCardapioInput = z.object({
  pedido_id: z.number().int(),
  codigo_item: z.string().min(1, "Código do item é obrigatório"),
  quantidade: z.number().int().min(1, "Quantidade mínima é 1"),
  observacao: z.string().optional(),
});

const updatePedidoCardapioInput = z.object({
  pedido_id: z.number().int(),
  codigo_item: z.string().min(1),
  quantidade: z.number().int().min(1).optional(),
  observacao: z.string().optional(),
});

const pedidoCardapioInput = z.object({
  pedido_id: z.number().int(),
  codigo_item: z.string().min(1),
});

export const pedidoCardapioRouter = createTRPCRouter({
  getPedidoCardapioById: publicProcedure
    .input(pedidoCardapioInput)
    .query(async ({ input }) => {
      const pedidoCardapio = await db.pedidoCardapio.findUnique({
        where: {
          pedido_id_codigo_item: {
            pedido_id: input.pedido_id,
            codigo_item: input.codigo_item,
          },
        },
        include: {
          pedido: true,
          item: true,
        },
      });

      if (!pedidoCardapio) {
        throw new Error("Item não encontrado neste pedido.");
      }

      return pedidoCardapio as PedidoCardapioType;
    }),

  getItensByPedidoId: publicProcedure
    .input(z.object({ pedido_id: z.number().int() }))
    .query(async ({ input }) => {
      const itens = await db.pedidoCardapio.findMany({
        where: { pedido_id: input.pedido_id },
        include: { item: true },
      });

      return itens as PedidoCardapioType[];
    }),

  createPedidoCardapio: publicProcedure
    .input(createPedidoCardapioInput)
    .mutation(async ({ input }) => {
      const existe = await db.pedidoCardapio.findUnique({
        where: {
          pedido_id_codigo_item: {
            pedido_id: input.pedido_id,
            codigo_item: input.codigo_item,
          },
        },
      });

      if (existe) {
        throw new Error("Este item já foi adicionado ao pedido.");
      }

      const criado = await db.pedidoCardapio.create({
        data: input,
      });

      if (!criado) {
        throw new Error("Erro ao adicionar item ao pedido.");
      }

      return criado as PedidoCardapioType;
    }),

  updatePedidoCardapio: publicProcedure
    .input(updatePedidoCardapioInput)
    .mutation(async ({ input }) => {
      const { pedido_id, codigo_item, ...data } = input;

      const existe = await db.pedidoCardapio.findUnique({
        where: {
          pedido_id_codigo_item: { pedido_id, codigo_item },
        },
      });

      if (!existe) {
        throw new Error("Item não encontrado no pedido.");
      }

      const atualizado = await db.pedidoCardapio.update({
        where: {
          pedido_id_codigo_item: { pedido_id, codigo_item },
        },
        data,
      });

      return atualizado as PedidoCardapioType;
    }),

  deletePedidoCardapio: publicProcedure
    .input(pedidoCardapioInput)
    .mutation(async ({ input }) => {
      const existe = await db.pedidoCardapio.findUnique({
        where: {
          pedido_id_codigo_item: {
            pedido_id: input.pedido_id,
            codigo_item: input.codigo_item,
          },
        },
      });

      if (!existe) {
        throw new Error("Item não encontrado no pedido.");
      }

      const deletado = await db.pedidoCardapio.delete({
        where: {
          pedido_id_codigo_item: {
            pedido_id: input.pedido_id,
            codigo_item: input.codigo_item,
          },
        },
      });

      return deletado as PedidoCardapioType;
    }),
});