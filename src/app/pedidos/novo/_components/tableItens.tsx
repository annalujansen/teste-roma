"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import { ShoppingCart, Trash2 } from "lucide-react";
import type { ItemPedido } from "../page"; 

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

interface TableItensProps {
    itens: ItemPedido[];
    onRemoveItem: (codigo_item: string) => void;
    onUpdateItem: (codigo_item: string, updates: Partial<Pick<ItemPedido, 'quantidade' | 'observacao'>>) => void;
}

export default function TableItens({ itens, onRemoveItem, onUpdateItem }: TableItensProps) {
    return (
        <div className="container mx-auto px-4 border-2 border-[#FED7AA] rounded-xl bg-[#FFFBEB]">
            <div className='flex items-center mt-4 p-4'>
                <ShoppingCart className='text-[#9A3412] mr-2' />
                <span className="text-2xl text-[#9A3412] font-semibold">Itens do Pedido</span>
            </div>
            <div className="overflow-x-auto p-4 mb-7">
                <Table>
                    <TableHeader className="bg-[#FFEDD580]">
                        <TableRow>
                            <TableHead className="text-[#64748B] font-semibold">Código</TableHead>
                            <TableHead className="text-[#64748B] font-semibold">Nome do Item</TableHead>
                            <TableHead className="text-[#64748B] font-semibold">Quantidade</TableHead>
                            <TableHead className="text-[#64748B] font-semibold">Preço Unt.</TableHead>
                            <TableHead className="text-[#64748B] font-semibold">Observação</TableHead>
                            <TableHead className="text-[#64748B] font-semibold">Total</TableHead>
                            <TableHead className="text-[#64748B] font-semibold text-center">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white">
                        {itens.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500 h-24">
                                    Nenhum item adicionado ao pedido.
                                </TableCell>
                            </TableRow>
                        ) : (
                            itens.map((item) => (
                                <TableRow key={item.codigo_item} className="my-8">
                                    <TableCell className="text-[#374151] h-[72px]">{item.codigo_item}</TableCell>
                                    <TableCell className="text-[#374151]">{item.nome_item}</TableCell>
                                    <TableCell className="text-[#374151]">
                                        <input
                                            type="number"
                                            className="border border-gray-300 rounded-sm p-1 w-20 text-center"
                                            value={item.quantidade}
                                            onChange={(e) => onUpdateItem(item.codigo_item, { quantidade: parseInt(e.target.value, 10) || 1 })}
                                            min={1}
                                            max={100}
                                            step={1}
                                        />
                                    </TableCell>
                                    <TableCell className="text-[#374151]">{formatCurrency(item.preco)}</TableCell>
                                    <TableCell className="text-[#374151]">
                                        <input 
                                            type="text" 
                                            className="border border-gray-300 rounded-sm p-1 w-full" 
                                            placeholder="Sem Borda, tirar cebola..." 
                                            value={item.observacao ?? ''}
                                            onChange={(e) => onUpdateItem(item.codigo_item, { observacao: e.target.value })}
                                        />
                                    </TableCell>
                                    <TableCell className="text-[#059669] font-semibold">{formatCurrency(item.preco * item.quantidade)}</TableCell>
                                    <TableCell className="text-[#374151] text-center">
                                        <button onClick={() => onRemoveItem(item.codigo_item)} aria-label="Remover item">
                                            <Trash2 className="text-red-500 hover:text-red-700 cursor-pointer inline-block" size={20} />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}