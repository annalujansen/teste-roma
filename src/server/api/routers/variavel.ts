import { db } from "~/server/db";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export interface VariavelType {
  nome: string;
  valor: string;
}

const createVariavelInput = z.object({
  nome: z.string().min(1),
  valor: z.string().min(1),
});

const updateVariavelInput = z.object({
  nome: z.string().min(1),
  valor: z.string().min(1).optional(),
});

const variavelInput = z.object({
  nome: z.string().min(1),
});

const verificarSenhaInput = z.object({
  tipo: z.enum(["basic", "admin"]),
  senha: z.string().min(1),
});

export const variaveisRouter = createTRPCRouter({
  getVariavelByNome: publicProcedure
    .input(variavelInput)
    .query(async ({ input }) => {
      const variavel = await db.variavel.findUnique({
        where: { nome: input.nome },
      });

      if (!variavel) {
        throw new Error("Variável não encontrada");
      }
      return variavel as VariavelType;
    }),

  getAllVariaveis: publicProcedure
    .query(async () => {
      const variaveis = await db.variavel.findMany();
      return variaveis as VariavelType[];
    }),

  createVariavel: publicProcedure
    .input(createVariavelInput)
    .mutation(async ({ input }) => {
      const existe = await db.variavel.findUnique({ where: { nome: input.nome } });
      if (existe) {
        throw new Error("Variável com esse nome já existe");
      }

      const variavelCriada = await db.variavel.create({
        data: { ...input },
      });

      if (!variavelCriada) {
        throw new Error("Erro ao criar variável");
      }
      return variavelCriada as VariavelType;
    }),

  updateVariavel: publicProcedure
    .input(updateVariavelInput)
    .mutation(async ({ input }) => {
      const { nome, ...data } = input;
      const variavelAtualizada = await db.variavel.update({
        where: { nome },
        data,
      });

      if (!variavelAtualizada) {
        throw new Error("Erro ao atualizar variável");
      }
      return variavelAtualizada as VariavelType;
    }),

  deleteVariavel: publicProcedure
    .input(variavelInput)
    .mutation(async ({ input }) => {
      const variavelDeletada = await db.variavel.delete({
        where: { nome: input.nome },
      });

      if (!variavelDeletada) {
        throw new Error("Erro ao deletar variável");
      }
      return variavelDeletada as VariavelType;
    }),

  verificarSenha: publicProcedure
    .input(verificarSenhaInput)
    .query(async ({ input }) => {
      const nomeVariavel = input.tipo === "admin" ? "senhaAdmin" : "senhaBasic";

      const variavel = await db.variavel.findUnique({
        where: { nome: nomeVariavel },
      });

      if (!variavel) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Senha do tipo '${input.tipo}' não encontrada.`,
        });
      }

      const senhaCorreta = input.senha === variavel.valor;

      if (!senhaCorreta) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Senha incorreta",
        });
      }

      return {
        success: true,
        tipo: input.tipo,
      };
    }),
});