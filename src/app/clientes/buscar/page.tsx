"use client";

import { Search, Loader2 } from "lucide-react";
// Adicione a importação do useEffect
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { buscarClienteSchema, formatTelefoneBR } from '~/lib/clientes';
import { api } from '~/trpc/react';

export default function BuscarCliente() {
    const router = useRouter();
    const [telefone, setTelefone] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 1. A chamada ao useQuery agora é mais simples, sem os callbacks
    const { data, error, isSuccess, isError, refetch, isFetching } = api.cliente.getClienteByTelefone.useQuery(
        { telefone: telefone.replace(/\D/g, "") },
        {
            enabled: false, // Mantém a query desabilitada até o refetch
            retry: false,   // Mantém para não tentar de novo em caso de 404
        }
    );

    // 2. Usamos useEffect para reagir ao resultado da query
    useEffect(() => {
        // Se a query foi executada e terminou com sucesso
        if (isSuccess && data) {
            console.log("Cliente encontrado:", data);
            router.push(`/pedidos/novo?telefone=${data.telefone}`);
        }

        // Se a query foi executada e terminou com erro
        if (isError) {
            if (error.message.includes("Cliente não encontrado")) {
                router.push(`/clientes/novo?telefone=${telefone.replace(/\D/g, "")}`);
            } else {
                // Foi um erro inesperado do servidor
                setErrorMsg("Erro ao buscar cliente. Tente novamente.");
            }
        }
        // Dependências: o useEffect roda sempre que um desses valores mudar
    }, [isSuccess, isError, data, error, router, telefone]);


    function onChangeTelefone(v: string) {
        const digits = v.replace(/\D/g, "").slice(0, 9);
        setTelefone(formatTelefoneBR(digits));
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);

        const parsed = buscarClienteSchema.safeParse({ telefone });
        if (!parsed.success) {
            setErrorMsg(parsed.error?.errors?.[0]?.message ?? "Erro de validação");
            return;
        }

        // Apenas chamamos o refetch. O useEffect cuidará do resultado.
        refetch();
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="font-semibold text-xl">Buscar Cliente</h1>
            <h2 className='font-extralight text-sm mb-4'>Digite o telefone para iniciar</h2>

            <form onSubmit={onSubmit} className="flex flex-col gap-3">
                <input
                    type="tel"
                    inputMode="tel"
                    className="px-15 py-3 text-center border-1 border-gray-200 rounded-sm"
                    name="telefone"
                    value={telefone}
                    onChange={(e) => onChangeTelefone(e.target.value)}
                    placeholder="99999-9999"
                    disabled={isFetching}
                />
                {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
                <button
                    className="flex gap-2 px-15 py-3 justify-center text-white bg-blue-400 hover:bg-blue-600 rounded-sm cursor-pointer disabled:bg-gray-400"
                    type="submit"
                    disabled={isFetching}
                >
                    {isFetching ? <Loader2 className="animate-spin" /> : <Search />}
                    {isFetching ? "Buscando..." : "Buscar"}
                </button>
            </form>
        </div>
    );
}