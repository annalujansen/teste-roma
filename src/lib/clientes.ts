import { z } from "zod";

// ------- Tipos de Dados -------
export type Local = {
    local_id: number;
    bairro: string;
    taxa: number;
};

export type Cliente = {
    telefone: string;
    nome: string;
    cpf?: string | null;
    endereco: string;
    local_id: number;
};

// ------- Helpers -------
export function onlyDigits(s: string) {
    return s.replace(/\D/g, "");
}

/**
 * Formata um número de telefone local (sem DDD).
 * - 8 dígitos: XXXX-XXXX (fixo)
 * - 9 dígitos: XXXXX-XXXX (celular)
 */
export function formatTelefoneBR(input: string) {
    const v = onlyDigits(input).slice(0, 9);

    if (v.length <= 4) {
        return v;
    }
    if (v.length <= 8) {
        return `${v.slice(0, 4)}-${v.slice(4)}`;
    }
    return `${v.slice(0, 5)}-${v.slice(5)}`;
}

/**
 * Valida se o telefone é um número local válido (8 ou 9 dígitos).
 */
export function isTelefoneValido(t: string) {
    const digits = onlyDigits(t);
    return digits.length === 8 || digits.length === 9;
}

export function formatCpf(input: string) {
  const v = onlyDigits(input).slice(0, 11);
  if (v.length <= 3) return v;
  if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`;
  if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
  return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
}

// ------- Zod Schemas para Validação de Formulários -------

/**
 * Schema para validar a busca de um cliente pelo telefone.
 */
export const buscarClienteSchema = z.object({
    telefone: z
        .string()
        .transform(onlyDigits)
        .refine(isTelefoneValido, "Telefone deve ter 8 ou 9 dígitos."),
});

/**
 * Schema para validar a criação de um novo cliente.
 */
export const criarClienteSchema = z.object({
    telefone: z
        .string()
        .transform(onlyDigits)
        .refine(isTelefoneValido, "Telefone deve ter 8 ou 9 dígitos."),
    nome: z.string().min(3, "Informe o nome completo"),
    cpf: z
        .string()
        .optional()
        .transform((v) => (v ? onlyDigits(v) : undefined))
        .refine(
            (v) => !v || v.length === 11, // opcional, mas se vier, 11 dígitos
            "CPF deve ter 11 dígitos."
        ),
    endereco: z.string().min(5, "Endereço deve ter ao menos 5 caracteres"),
    local_id: z
        .number({ invalid_type_error: "Selecione um local." })
        .positive("Selecione um local."),
});

// Tipos inferidos dos schemas para uso no front-end (ex: com react-hook-form)
export type BuscarClienteData = z.infer<typeof buscarClienteSchema>;
export type CriarClienteData = z.infer<typeof criarClienteSchema>;