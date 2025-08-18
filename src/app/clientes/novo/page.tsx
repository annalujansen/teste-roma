"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
// CORREÇÃO #1: Usar 'import type' para os tipos
import type { CriarClienteData, Local } from "~/lib/clientes";
import {
    criarClienteSchema,
    formatTelefoneBR,
    formatCpf
} from "~/lib/clientes";
import { api } from "~/trpc/react";

export default function CriarCliente() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const telefoneQuery = searchParams.get("telefone") ?? "";

    const [formData, setFormData] = useState<Partial<CriarClienteData>>({
        telefone: telefoneQuery,
        nome: "",
        cpf: "",
        endereco: "",
    });
    const [formError, setFormError] = useState<string | null>(null);
    
    // CORREÇÃO #2: O caminho correto é 'api.local', não 'api.locais'
    const locaisQuery = api.local.getAllLocais.useQuery();

    const createClienteMutation = api.cliente.createCliente.useMutation({
        onSuccess: (data) => {
            router.replace(`/pedidos/novo?telefone=${data.telefone}`);
        },
        onError: (error) => {
            setFormError(error.message);
        },
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        const valueToUpdate = name === 'local_id'
            ? (value ? parseInt(value, 10) : "")
            : value;

        setFormData(prev => ({ ...prev, [name]: valueToUpdate }));
    };

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);

        const parsed = criarClienteSchema.safeParse({
            ...formData,
            cpf: formData.cpf?.replace(/\D/g, "") || undefined,
        });

        if (!parsed.success) {
            setFormError(parsed.error?.errors?.[0]?.message ?? "Erro de validação");
            return;
        }

        createClienteMutation.mutate(parsed.data);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="flex flex-col items-center">
                <h1 className="font-semibold text-xl">Novo Cliente</h1>
                <h2 className='text-gray-500 text-sm mb-4'>{formatTelefoneBR(telefoneQuery)}</h2>
            </div>

            <Link href="/clientes/buscar" className="flex text-gray-500 mb-4">
                <ArrowLeft color="#6a7282" />
                Voltar
            </Link>

            <form onSubmit={onSubmit} className="w-full max-w-sm flex flex-col gap-4">
                <div>
                    <label className="font-semibold">Nome *</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        name="nome"
                        placeholder="Nome completo"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className="font-semibold">CPF</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        className="w-full p-2 border rounded"
                        name="cpf"
                        placeholder="000.000.000-00"
                        value={formatCpf(formData.cpf ?? "")}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="font-semibold">Endereço *</label>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        name="endereco"
                        placeholder="Endereço completo"
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className="font-semibold">Local de entrega *</label>
                    <select
                        className="w-full p-2 border rounded"
                        name="local_id"
                        onChange={handleChange}
                        defaultValue=""
                        required
                    >
                        <option value="" disabled>
                            {locaisQuery.isLoading ? "Carregando..." : "Selecione um local"}
                        </option>
                        {/* A correção do tRPC path conserta o erro de 'any' aqui */}
                        {locaisQuery.data?.map((local) => (
                            <option key={local.local_id} value={local.local_id}>
                                {local.bairro}
                            </option>
                        ))}
                    </select>
                </div>

                {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}

                <div className="flex gap-2 justify-center mt-4">
                    <Link href="/clientes/buscar" className="px-10 py-3 border rounded-md">
                        Cancelar
                    </Link>
                    <button 
                        type="submit" 
                        className="flex justify-center items-center px-10 py-3 text-white bg-blue-500 hover:bg-blue-600 rounded-md cursor-pointer disabled:bg-gray-400"
                        disabled={createClienteMutation.isPending}
                    >
                        {createClienteMutation.isPending 
                            ? <Loader2 className="animate-spin" /> 
                            : "Cadastrar"
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}