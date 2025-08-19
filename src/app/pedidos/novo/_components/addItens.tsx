"use client";

import { Package, Search, PlusCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import type { ItemType } from "~/server/api/routers/item"; // Importando o tipo do item

interface AddItensProps {
  onAddItem: (item: ItemType) => void;
}

export default function AddItens({ onAddItem }: AddItensProps) {
  const [query, setQuery] = useState("");

  // 1. Busca todos os itens da API uma única vez
  const { data: allItems, isLoading, error } = api.item.getAllItems.useQuery();

  // 2. Filtra os itens com base na busca do usuário
  const filteredItems = useMemo(() => {
    // Se não houver busca ou itens, retorna uma lista vazia
    if (!query || !allItems) {
      return [];
    }
    const lowerCaseQuery = query.toLowerCase();
    return allItems.filter(item =>
      item.nome_item.toLowerCase().includes(lowerCaseQuery) ||
      item.codigo_item.toLowerCase().includes(lowerCaseQuery)
    );
  }, [query, allItems]); // Recalcula apenas quando a busca ou a lista de itens mudar

  const handleSelectAndAddItem = (item: ItemType) => {
    onAddItem(item); // Chama a função do componente pai para adicionar o item
    setQuery(""); // Limpa a busca após adicionar
  };

  return (
    <div className="container mx-auto px-4 border-2 border-[#BBF7D0] rounded-xl bg-[#ECFDF5]">
      <div className="flex items-center mt-4 p-4">
        <Package className="text-[#166534] mr-2" />
        <span className="text-2xl text-[#166534] font-semibold">Adicionar Itens ao Pedido</span>
      </div>

      <div className="mx-4 my-4 relative mb-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={isLoading ? "Carregando cardápio..." : "Busque pelo nome ou código do item..."}
          className="border border-[#BBF7D0] rounded-md p-2 pl-10 w-full bg-white focus:outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
        />

        {error && <p className="text-red-500 mt-2">Erro ao carregar itens.</p>}
        {filteredItems.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            <ul>
              {filteredItems.map(item => (
                <li
                  key={item.codigo_item}
                  className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => handleSelectAndAddItem(item)}
                >
                  <div>
                    <p className="font-semibold">{item.nome_item}</p>
                    <p className="text-sm text-gray-500">Código: {item.codigo_item} | Preço: R$ {item.preco.toFixed(2)}</p>
                  </div>
                  <PlusCircle className="text-green-600" />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}