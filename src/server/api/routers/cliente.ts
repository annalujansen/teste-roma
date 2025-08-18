import { db } from "~/server/db";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type { Prisma } from "@prisma/client";

export interface ClienteType {
  telefone: string;
  nome: string;
  cpf?: string;
  endereco: string;
  local_id: number;
}

const createClienteInput = z.object({
  telefone: z.string().min(1),
  nome: z.string().min(1),
  cpf: z.string().optional(),
  endereco: z.string().min(1),
  local_id: z.number().int(),
});

const updateClienteInput = z.object({
  telefone: z.string().min(1),
  nome: z.string().optional(),
  cpf: z.string().optional(),
  endereco: z.string().optional(),
  local_id: z.number().int().optional(),
});

const clienteInput = z.object({
  telefone: z.string().min(1),
});

export const clienteRouter = createTRPCRouter({
  getClienteByTelefone: publicProcedure
    .input(clienteInput)
    .query(async ({ input }) => {
      const cliente = await db.cliente.findUnique({
        where: { telefone: input.telefone },
        include: { local: true },
      });

      if (!cliente) {
        throw new Error("Cliente não encontrado");
      }
      return cliente;
    }),

  getAllClientes: publicProcedure
    .query(async () => {
      const clientes = await db.cliente.findMany({
        include: { local: true },
      });
      return clientes;
    }),

  createCliente: publicProcedure
    .input(createClienteInput)
    .mutation(async ({ input }) => {
      const existe = await db.cliente.findUnique({
        where: { telefone: input.telefone },
      });

      if (existe) {
        throw new Error("Cliente já existe com este telefone");
      }

      const clienteCriado = await db.cliente.create({
        data: {
          telefone: input.telefone,
          nome: input.nome,
          cpf: input.cpf,
          endereco: input.endereco,
          local: { connect: { local_id: input.local_id } },
        },
        include: { local: true },
      });

      return clienteCriado;
    }),

  updateCliente: publicProcedure
    .input(updateClienteInput)
    .mutation(async ({ input }) => {
      const { telefone, ...resto } = input;

      const clienteExistente = await db.cliente.findUnique({
        where: { telefone },
      });

      if (!clienteExistente) {
        throw new Error("Cliente não encontrado");
      }

      const dataToUpdate: Prisma.ClienteUpdateInput = {};

      if (resto.nome !== undefined) dataToUpdate.nome = resto.nome;
      if (resto.cpf !== undefined) dataToUpdate.cpf = resto.cpf;
      if (resto.endereco !== undefined) dataToUpdate.endereco = resto.endereco;

      if (resto.local_id !== undefined) {
        dataToUpdate.local = { connect: { local_id: resto.local_id } };
      }

      const clienteAtualizado = await db.cliente.update({
        where: { telefone },
        data: dataToUpdate,
        include: { local: true },
      });

      return clienteAtualizado;
    }),

  deleteCliente: publicProcedure
    .input(clienteInput)
    .mutation(async ({ input }) => {
      const clienteExistente = await db.cliente.findUnique({
        where: { telefone: input.telefone },
      });

      if (!clienteExistente) {
        throw new Error("Cliente não encontrado");
      }

      const clienteDeletado = await db.cliente.delete({
        where: { telefone: input.telefone },
      });

      return clienteDeletado;
    }),
});