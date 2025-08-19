"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '~/trpc/react';

import AddItens from './_components/addItens';
import InfoCliente from './_components/infoCliente';
import Resumo from './_components/resumo';
import TableItens from './_components/tableItens';

import type { ItemType } from '~/server/api/routers/item';

export interface ItemPedido extends ItemType {
    quantidade: number;
    observacao?: string;
}

export interface PedidoDetails {
    enderecoEntrega: string;
    local_id: number | "";
    turno: string;
    observacao: string;
}

export default function CadastroPedidoPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const telefone = searchParams.get('telefone');

    const [itensDoPedido, setItensDoPedido] = useState<ItemPedido[]>([]);
    const [pedidoDetails, setPedidoDetails] = useState<PedidoDetails>({
        enderecoEntrega: "",
        local_id: "",
        turno: "",
        observacao: "",
    });

    const clienteQuery = api.cliente.getClienteByTelefone.useQuery(
        { telefone: telefone ?? "" },
        { enabled: !!telefone }
    );
    const locaisQuery = api.local.getAllLocais.useQuery();

    useEffect(() => {
        if (clienteQuery.data) {
            setPedidoDetails(prev => ({
                ...prev,
                enderecoEntrega: prev.enderecoEntrega || clienteQuery.data.endereco,
                local_id: prev.local_id || clienteQuery.data.local_id,
            }));
        }
    }, [clienteQuery.data]);

    const handleAddItem = (item: ItemType) => {
        setItensDoPedido((prev) => {
            const existente = prev.find(p => p.codigo_item === item.codigo_item);
            if (existente) {
                return prev.map(p => p.codigo_item === item.codigo_item ? { ...p, quantidade: p.quantidade + 1 } : p);
            }
            return [...prev, { ...item, quantidade: 1, observacao: '' }];
        });
    };

    const handleRemoveItem = (codigo_item: string) => {
        setItensDoPedido((prev) => prev.filter(p => p.codigo_item !== codigo_item));
    };

    const handleUpdateItem = (codigo_item: string, updates: Partial<Pick<ItemPedido, 'quantidade' | 'observacao'>>) => {
        setItensDoPedido((prev) => prev.map(p => p.codigo_item === codigo_item ? { ...p, ...updates } : p));
    };
    
    const handlePedidoDetailsChange = (field: keyof PedidoDetails, value: string | number) => {
        setPedidoDetails(prev => ({ ...prev, [field]: value }));
    };

    const createPedidoMutation = api.pedido.createPedido.useMutation({
        onSuccess: (data) => {
            alert(`Pedido #${data.pedido_id} criado com sucesso!`);
            router.push('/'); // Redireciona para a página inicial
        },
        onError: (error) => {
            alert(`Erro ao criar pedido: ${error.message}`);
        }
    });

    const handleSubmitPedido = () => {
        if (!telefone || !pedidoDetails.local_id || !pedidoDetails.turno || itensDoPedido.length === 0) {
            alert("Por favor, adicione itens e preencha todos os campos de entrega para finalizar o pedido.");
            return;
        }

        createPedidoMutation.mutate({
            telefone_cliente: telefone,
            endereco: pedidoDetails.enderecoEntrega,
            local_id: pedidoDetails.local_id as number,
            turno: pedidoDetails.turno as "almoco" | "jantar",
            forma_pagamento: "dinheiro", // Valor padrão, pode ser alterado depois
            observacao: pedidoDetails.observacao,
            status: 'pendente',
            data_hora: new Date(),
            itens: itensDoPedido.map(item => ({
                codigo_item: item.codigo_item,
                quantidade: item.quantidade,
                observacao: item.observacao,
            })),
        });
    };
    
    if (!telefone) {
        return (
            <div className="text-center mt-20">
                <h2 className="text-2xl font-bold text-red-600">Erro</h2>
                <p className="text-gray-600">Nenhum telefone de cliente foi fornecido.</p>
            </div>
        );
    }

    return (
        <div className="mb-8 px-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold flex justify-center mt-8 mb-10">
                Cadastrar Pedido
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start">
                <div className="space-y-8">
                    <InfoCliente 
                        cliente={clienteQuery.data}
                        locais={locaisQuery.data}
                        pedidoDetails={pedidoDetails}
                        onPedidoDetailsChange={handlePedidoDetailsChange}
                    />
                    <AddItens onAddItem={handleAddItem} />
                    <TableItens 
                        itens={itensDoPedido} 
                        onRemoveItem={handleRemoveItem} 
                        onUpdateItem={handleUpdateItem}
                    />
                </div>

                <Resumo 
                    itens={itensDoPedido}
                    locais={locaisQuery.data}
                    localIdSelecionado={pedidoDetails.local_id}
                    observacao={pedidoDetails.observacao}
                    onObservacaoChange={(value) => handlePedidoDetailsChange('observacao', value)}
                    onSubmit={handleSubmitPedido}
                    isSubmitting={createPedidoMutation.isPending}
                />
            </div>
        </div>
    );
}