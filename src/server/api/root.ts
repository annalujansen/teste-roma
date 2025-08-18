import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { clienteRouter } from "~/server/api/routers/cliente";
import { locaisRouter } from "~/server/api/routers/local";
import { pedidosRouter } from "~/server/api/routers/pedido";
import { itemsRouter } from "~/server/api/routers/item";
import { pedidoCardapioRouter } from "~/server/api/routers/pedidoCardapio";
import { variaveisRouter } from "~/server/api/routers/variavel";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // Cliente
  cliente: clienteRouter,

  // Endereços
  local: locaisRouter,

  // Cardápio e Pedidos
  pedido: pedidosRouter,
  item: itemsRouter,
  pedidoCardapio: pedidoCardapioRouter,

  // Variáveis de Configuração
  variaveis: variaveisRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.pedido.all();
 *       ^? Pedido[]
 */
export const createCaller = createCallerFactory(appRouter);
