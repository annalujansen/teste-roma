import { db } from "~/server/db";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export interface LocalType {
    nome: string;
    local_id: number;
    bairro: string;
    taxa: number;
}

const createLocalInput = z.object({
    bairro: z.string().min(1, "Informe o bairro"),
    taxa: z.number().positive("Taxa deve ser um número positivo"),
});

const updateLocalInput = z.object({
    local_id: z.number().int(),
    bairro: z.string().min(1, "Informe o bairro").optional(),
    taxa: z.number().positive().optional(),
});

const localInput = z.object({
    local_id: z.number().int(),
});

export const locaisRouter = createTRPCRouter({
    getLocalById: publicProcedure
        .input(localInput)
        .query(async ({ input }) => {
            const local = await db.local.findUnique({
                where: { local_id: input.local_id },
            });

            if (!local) {
                throw new Error("Local não encontrado");
            }
            return local as LocalType;
        }),

    getAllLocais: publicProcedure
        .query(async () => {
            const locais = await db.local.findMany();
            return locais as LocalType[];
        }),

    createLocal: publicProcedure
        .input(createLocalInput)
        .mutation(async ({ input }) => {
            const localCriado = await db.local.create({
                data: { ...input },
            });

            if (!localCriado) {
                throw new Error("Erro ao criar local");
            }
            return localCriado as LocalType;
        }),

    updateLocal: publicProcedure
        .input(updateLocalInput)
        .mutation(async ({ input }) => {
            const { local_id, ...data } = input;
            const localAtualizado = await db.local.update({
                where: { local_id: local_id },
                data: data,
            });

            if (!localAtualizado) {
                throw new Error("Erro ao atualizar local");
            }
            return localAtualizado as LocalType;
        }),

    deleteLocal: publicProcedure
        .input(localInput)
        .mutation(async ({ input }) => {
            if (!(await db.local.findUnique({ where: { local_id: input.local_id } }))) {
                throw new Error("Local não encontrado");
            }
            const localDeletado = await db.local.delete({
                where: { local_id: input.local_id },
            });
            if (!localDeletado) {
                throw new Error("Erro ao deletar local");
            }
            return localDeletado as LocalType;
        }),
});