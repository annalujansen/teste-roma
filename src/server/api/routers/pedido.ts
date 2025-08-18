import { db } from "~/server/db";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { StatusPedido, Turno, FormaPagamento } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export interface PedidoType {
    pedido_id: number;
    status: StatusPedido;
    telefone_cliente: string; // FK1
    data_hora: Date;
    local_id: number; // FK2
    observacao?: string;
    turno: Turno;
    forma_pagamento: FormaPagamento;
    endereco: string;
}

const createPedidoInput = z.object({
    status: z.nativeEnum(StatusPedido),
    telefone_cliente: z.string().min(1),
    data_hora: z.date(),
    local_id: z.number().int(),
    observacao: z.string().optional(),
    turno: z.nativeEnum(Turno),
    forma_pagamento: z.nativeEnum(FormaPagamento),
    endereco: z.string().min(1),

    itens: z.array(z.object({
        codigo_item: z.string().min(1),
        quantidade: z.number().int().min(1),
        observacao: z.string().optional(),
    })).optional(),
});

const updatePedidoInput = z.object({
    pedido_id: z.number().int(), // PK for update
    status: z.string().min(1).optional(),
    data_hora: z.date().optional(),
    local_id: z.number().int().optional(),
    observacao: z.string().optional().nullable(),
    turno: z.string().min(1).optional(),
    forma_pagamento: z.string().min(1).optional(),
    endereco: z.string().min(1).optional(),
    itens: z.array(z.object({
        codigo_item: z.string().min(1),
        quantidade: z.number().int().min(1),
        observacao: z.string().optional(),
    })).optional(),
});

const filtroPedidosInput = z.object({
    cliente: z.string().optional(),
    status: z.enum(["pendente", "entregue", "cancelado"]).optional(),
    turno: z.enum(["almoco", "jantar"]).optional(),
    mes: z.date().optional(),
    ordem: z.enum(["mais_recentes", "mais_antigos"]).default("mais_recentes"),
});

const pedidoInput = z.object({
    pedido_id: z.number().int(),
});

export const pedidosRouter = createTRPCRouter({
    getPedidoById: publicProcedure
        .input(pedidoInput)
        .query(async ({ input }) => {
            const pedido = await db.pedido.findUnique({
                where: { pedido_id: input.pedido_id },
                include: {
                    cliente: true, // Include related cliente data
                    local: true, // Include related local data
                    pedidoCardapio: {
                        include: {
                            item: true,
                        },
                    },
                },
            });

            if (!pedido) {
                throw new Error("Pedido não encontrado");
            }
            return pedido;
        }),

    getPedidosFiltrados: publicProcedure
        .input(filtroPedidosInput)
        .query(async ({ input }) => {
            const { cliente, status, turno, mes, ordem } = input;

            const where: Prisma.PedidoWhereInput = {};

            if (cliente) {
                where.cliente = {
                    nome: { contains: cliente },
                };
            }

            if (status) {
                where.status = status;
            }

            if (turno) {
                where.turno = turno;
            }

            if (mes) {
                const inicioMes = new Date(mes.getFullYear(), mes.getMonth(), 1);
                const fimMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0, 23, 59, 59);
                where.data_hora = { gte: inicioMes, lte: fimMes };
            }

            const pedidos = await db.pedido.findMany({
                where,
                orderBy: {
                    data_hora: ordem === "mais_recentes" ? "desc" : "asc",
                },
                include: {
                    cliente: true,
                    local: true,
                    pedidoCardapio: {
                        include: { item: true },
                    },
                },
            });

            return pedidos;
        }),

    getAllPedidos: publicProcedure
        .query(async () => {
            const pedidos = await db.pedido.findMany({
                include: {
                    cliente: true,
                    local: true,
                    pedidoCardapio: {
                        include: {
                            item: true,
                        },
                    },
                },
            });
            return pedidos;
        }),

    createPedido: publicProcedure
        .input(createPedidoInput)
        .mutation(async ({ input }) => {
            const { itens, ...dadosPedido } = input;

            const pedidoCriado = await db.pedido.create({
                data: {
                    ...dadosPedido,
                    pedidoCardapio: {
                        create: (itens ?? []).map((item) => ({
                            codigo_item: item.codigo_item,
                            quantidade: item.quantidade,
                            observacao: item.observacao,
                        })),
                    },
                },
                include: {
                    pedidoCardapio: {
                        include: { item: true },
                    },
                },
            });

            if (!pedidoCriado) {
                throw new Error("Erro ao criar pedido");
            }

            return pedidoCriado;
        }),

    updatePedido: publicProcedure
        .input(updatePedidoInput)
        .mutation(async ({ input }) => {
            const { pedido_id, itens, local_id, ...resto } = input;

            const existePedido = await db.pedido.findUnique({
                where: { pedido_id },
            });

            if (!existePedido) {
                throw new Error("Pedido não encontrado");
            }

            await db.$transaction(async (tx) => {
                // Monta os dados para update, lidando com connect do local
                const dadosFiltrados = Object.fromEntries(
                    Object.entries(resto).filter(([_, v]) => v !== undefined)
                );

                const dataToUpdate: Prisma.PedidoUpdateInput = {
                    ...dadosFiltrados,
                };

                if (local_id !== undefined) {
                    dataToUpdate.local = { connect: { local_id } };
                }

                await tx.pedido.update({
                    where: { pedido_id },
                    data: dataToUpdate,
                });

                if (itens && itens.length > 0) {
                    await tx.pedidoCardapio.deleteMany({
                        where: { pedido_id },
                    });

                    await tx.pedidoCardapio.createMany({
                        data: itens.map((item) => ({
                            pedido_id,
                            codigo_item: item.codigo_item,
                            quantidade: item.quantidade,
                            observacao: item.observacao ?? null,
                        })),
                    });
                }
            });

            const pedidoComItens = await db.pedido.findUnique({
                where: { pedido_id },
                include: {
                    cliente: true,
                    local: true,
                    pedidoCardapio: {
                        include: { item: true },
                    },
                },
            });

            return pedidoComItens;
        }),

    deletePedido: publicProcedure
        .input(pedidoInput)
        .mutation(async ({ input }) => {
            const pedidoExistente = await db.pedido.findUnique({
                where: { pedido_id: input.pedido_id },
                include: {
                    cliente: true,
                    local: true,
                    pedidoCardapio: {
                        include: { item: true },
                    },
                },
            });

            if (!pedidoExistente) {
                throw new Error("Pedido não encontrado");
            }

            await db.$transaction(async (tx) => {
                await tx.pedidoCardapio.deleteMany({
                    where: { pedido_id: input.pedido_id },
                });

                await tx.pedido.delete({
                    where: { pedido_id: input.pedido_id },
                });
            });

            return pedidoExistente;
        }),
}
);