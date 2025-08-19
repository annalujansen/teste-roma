"use client";

import { useMemo } from "react";
import { CircleCheckBig, Receipt } from "lucide-react";
import type { ItemPedido } from "../page";
import type { Local } from "~/lib/clientes";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface ResumoProps {
    itens: ItemPedido[];
    locais: Local[] | undefined;
    localIdSelecionado: number | "";
    observacao: string;
    onObservacaoChange: (value: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export default function Resumo({ 
    itens, 
    locais, 
    localIdSelecionado, 
    observacao,
    onObservacaoChange,
    onSubmit,
    isSubmitting
}: ResumoProps) {
    // Calcula o subtotal dos itens.
    const subtotal = useMemo(() => {
        return itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
    }, [itens]);

    // Encontra a taxa de entrega baseada no local selecionado.
    const taxaDeEntrega = useMemo(() => {
        if (!localIdSelecionado || !locais) return 0;
        const local = locais.find(l => l.local_id === localIdSelecionado);
        return local?.taxa ?? 0;
    }, [localIdSelecionado, locais]);

    const total = subtotal + taxaDeEntrega;

    // Condição para desabilitar o botão de finalizar
    const isButtonDisabled = itens.length === 0 || !localIdSelecionado || isSubmitting;

    return (
        <div className="bg-[#F9F7FD] rounded-lg p-6 flex flex-col gap-4 border-2 border-purple-200 sticky top-8 max-w-xs w-full">
            <h2 className="text-lg font-bold text-purple-700 flex items-center gap-2">
                <Receipt size={20} />
                Resumo do Pedido
            </h2>

            <div className="flex justify-between">
                <span className="text-[#374151]">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-[#374151]">Taxa de Entrega:</span>
                <span className="font-semibold">{formatCurrency(taxaDeEntrega)}</span>
            </div>

            <div className="h-px bg-purple-200 my-2"></div>

            <div className="flex justify-between">
                <span className="text-[#6B21A8] text-xl font-medium">Total Geral:</span>
                <span className="text-[#6B21A8] font-semibold text-xl">{formatCurrency(total)}</span>
            </div>

            <div className="flex flex-col gap-4 mt-4">
                <textarea
                    placeholder="Ex: Pagamento na entrega, tirar cebola do pedido X..."
                    className="w-full border border-gray-300 rounded-md p-2 resize-none h-24"
                    value={observacao}
                    onChange={(e) => onObservacaoChange(e.target.value)}
                />

                <button 
                    className="bg-[#16A34A] text-white font-semibold py-3 rounded-md hover:bg-[#059669] transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    onClick={onSubmit}
                    disabled={isButtonDisabled}
                >
                    <CircleCheckBig className="text-white" size={20} />
                    {isSubmitting ? "Finalizando..." : "Finalizar Pedido"}
                </button>
            </div>
            
            {isButtonDisabled && !isSubmitting && (
                 <p className="text-center text-sm text-purple-600">
                    Adicione itens e selecione o local de entrega para finalizar.
                </p>
            )}
        </div>
    );
}