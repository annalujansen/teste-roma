"use client";

import { User, MapPin, PencilLine } from "lucide-react";
import { formatTelefoneBR } from "~/lib/clientes";
import type { Cliente, Local } from "~/lib/clientes";
import type { PedidoDetails } from "../page";

interface InfoClienteProps {
  cliente: Cliente | null | undefined;
  locais: Local[] | undefined;
  pedidoDetails: PedidoDetails;
  onPedidoDetailsChange: (field: keyof PedidoDetails, value: string | number) => void;
}

export default function InfoCliente({ cliente, locais, pedidoDetails, onPedidoDetailsChange }: InfoClienteProps) {

  if (!cliente) {
    return <div className="container mx-auto p-4 border-2 border-[#BFDBFE] rounded-xl bg-[#EFF6FF] text-center">Carregando informações do cliente...</div>;
  }

  return (
    <div className="container mx-auto px-4 border-2 border-[#BFDBFE] rounded-xl bg-[#EFF6FF]">
      <div className='flex items-center mt-4 p-4'>
        <User className='text-[#1E40AF] mr-2' />
        <span className="text-2xl text-[#1E40AF] font-semibold">Informações do Cliente</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 ">
        <div className="flex flex-col">
          <label className="font-semibold">Nome</label>
          <input
            type="text"
            className="border border-[#E2E8F0] rounded-md p-2 bg-white font-semibold"
            value={cliente.nome}
            disabled
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold">Telefone</label>
          <input
            type="tel"
            className="border border-[#E2E8F0] rounded-md p-2 bg-white"
            value={formatTelefoneBR(cliente.telefone)}
            disabled
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold">Endereço Fixo</label>
          <input
            type="text"
            className="border border-[#E2E8F0] rounded-md p-2 bg-white text-gray-500"
            value={cliente.endereco}
            disabled
          />
        </div>
      </div>
      <div className="h-px bg-[#E2E8F0] my-4 mx-4"></div>
      <div className='flex items-center mt-4 p-4'>
        <MapPin className='text-[#1E40AF] mr-2' size={20} color="#16A34A" />
        <span className="text-[#166534] text-xl font-semibold">Entrega do Pedido</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 ">
        <div className="flex flex-col">
          <label className="font-semibold">Endereço de Entrega</label>
          <div className="relative">
            <input
              type="text"
              className="w-full border border-[#E2E8F0] rounded-md p-2 bg-white pr-8"
              value={pedidoDetails.enderecoEntrega}
              onChange={(e) => onPedidoDetailsChange('enderecoEntrega', e.target.value)}
            />
            <PencilLine className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-800" size={16} />
          </div>
        </div>
        <div className="flex flex-col">
          <label className="font-semibold">Local de Entrega</label>
          <select
            className="border border-[#E2E8F0] rounded-md p-2 bg-white"
            name="local"
            value={pedidoDetails.local_id}
            onChange={(e) => onPedidoDetailsChange('local_id', Number(e.target.value))}
          >
            <option value="">Selecione um local</option>
            {locais?.map((local) => (
              <option
                key={local.local_id}
                value={local.local_id}
              >
                {local.bairro} - R${local.taxa.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="font-semibold">Turno</label>
          <select
            className="border border-[#E2E8F0] rounded-md p-2 bg-white"
            value={pedidoDetails.turno}
            onChange={(e) => onPedidoDetailsChange('turno', e.target.value)}
          >
            <option value="">Selecione um turno</option>
            <option value="almoco">Almoço</option>
            <option value="jantar">Jantar</option>
          </select>
        </div>
      </div>
    </div>
  )
}