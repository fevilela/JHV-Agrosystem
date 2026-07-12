export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "number"
  | "checkbox"
  | "textarea";

export type EntityField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  colSpan?: 1 | 2;
};

export type EntityConfig = {
  slug: string;
  model:
    | "owner"
    | "client"
    | "supplier"
    | "employee"
    | "veterinarian"
    | "farrier"
    | "instructor"
    | "handler";
  title: string;
  singular: string;
  fields: EntityField[];
  listColumns: { key: string; label: string }[];
};

const personBase: EntityField[] = [
  { name: "name", label: "Nome", type: "text", required: true, colSpan: 2 },
  { name: "cpfCnpj", label: "CPF/CNPJ", type: "text" },
  { name: "phone", label: "Telefone", type: "tel" },
  { name: "email", label: "E-mail", type: "email" },
  { name: "address", label: "Endereço", type: "text", colSpan: 2 },
  { name: "city", label: "Cidade", type: "text" },
  { name: "state", label: "UF", type: "text" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];

const staffBase: EntityField[] = [
  { name: "name", label: "Nome", type: "text", required: true, colSpan: 2 },
  { name: "cpf", label: "CPF", type: "text" },
  { name: "phone", label: "Telefone", type: "tel" },
  { name: "email", label: "E-mail", type: "email" },
  { name: "active", label: "Ativo", type: "checkbox" },
  { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
];

export const entities: Record<string, EntityConfig> = {
  proprietarios: {
    slug: "proprietarios",
    model: "owner",
    title: "Proprietários",
    singular: "Proprietário",
    fields: personBase,
    listColumns: [
      { key: "name", label: "Nome" },
      { key: "cpfCnpj", label: "CPF/CNPJ" },
      { key: "phone", label: "Telefone" },
      { key: "city", label: "Cidade" },
    ],
  },
  clientes: {
    slug: "clientes",
    model: "client",
    title: "Clientes",
    singular: "Cliente",
    fields: personBase,
    listColumns: [
      { key: "name", label: "Nome" },
      { key: "cpfCnpj", label: "CPF/CNPJ" },
      { key: "phone", label: "Telefone" },
      { key: "city", label: "Cidade" },
    ],
  },
  fornecedores: {
    slug: "fornecedores",
    model: "supplier",
    title: "Fornecedores",
    singular: "Fornecedor",
    fields: [
      ...personBase.slice(0, -1),
      {
        name: "productsOrServices",
        label: "Produtos/Serviços",
        type: "text",
        colSpan: 2,
      },
      { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
    ],
    listColumns: [
      { key: "name", label: "Nome" },
      { key: "cpfCnpj", label: "CPF/CNPJ" },
      { key: "phone", label: "Telefone" },
      { key: "productsOrServices", label: "Produtos/Serviços" },
    ],
  },
  funcionarios: {
    slug: "funcionarios",
    model: "employee",
    title: "Funcionários",
    singular: "Funcionário",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true, colSpan: 2 },
      { name: "cpf", label: "CPF", type: "text" },
      { name: "role", label: "Cargo", type: "text" },
      { name: "phone", label: "Telefone", type: "tel" },
      { name: "email", label: "E-mail", type: "email" },
      { name: "address", label: "Endereço", type: "text", colSpan: 2 },
      { name: "admissionDate", label: "Data de Admissão", type: "date" },
      { name: "salary", label: "Salário", type: "number" },
      { name: "active", label: "Ativo", type: "checkbox" },
      { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
    ],
    listColumns: [
      { key: "name", label: "Nome" },
      { key: "role", label: "Cargo" },
      { key: "phone", label: "Telefone" },
      { key: "active", label: "Ativo" },
    ],
  },
  veterinarios: {
    slug: "veterinarios",
    model: "veterinarian",
    title: "Veterinários",
    singular: "Veterinário",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true, colSpan: 2 },
      { name: "cpf", label: "CPF", type: "text" },
      { name: "crmv", label: "CRMV", type: "text" },
      { name: "phone", label: "Telefone", type: "tel" },
      { name: "email", label: "E-mail", type: "email" },
      { name: "specialty", label: "Especialidade", type: "text" },
      { name: "active", label: "Ativo", type: "checkbox" },
      { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
    ],
    listColumns: [
      { key: "name", label: "Nome" },
      { key: "crmv", label: "CRMV" },
      { key: "specialty", label: "Especialidade" },
      { key: "phone", label: "Telefone" },
    ],
  },
  ferradores: {
    slug: "ferradores",
    model: "farrier",
    title: "Ferradores",
    singular: "Ferrador",
    fields: staffBase,
    listColumns: [
      { key: "name", label: "Nome" },
      { key: "phone", label: "Telefone" },
      { key: "email", label: "E-mail" },
      { key: "active", label: "Ativo" },
    ],
  },
  instrutores: {
    slug: "instrutores",
    model: "instructor",
    title: "Instrutores",
    singular: "Instrutor",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true, colSpan: 2 },
      { name: "cpf", label: "CPF", type: "text" },
      { name: "phone", label: "Telefone", type: "tel" },
      { name: "email", label: "E-mail", type: "email" },
      { name: "specialty", label: "Especialidade", type: "text" },
      { name: "active", label: "Ativo", type: "checkbox" },
      { name: "notes", label: "Observações", type: "textarea", colSpan: 2 },
    ],
    listColumns: [
      { key: "name", label: "Nome" },
      { key: "specialty", label: "Especialidade" },
      { key: "phone", label: "Telefone" },
      { key: "active", label: "Ativo" },
    ],
  },
  tratadores: {
    slug: "tratadores",
    model: "handler",
    title: "Tratadores",
    singular: "Tratador",
    fields: staffBase,
    listColumns: [
      { key: "name", label: "Nome" },
      { key: "phone", label: "Telefone" },
      { key: "email", label: "E-mail" },
      { key: "active", label: "Ativo" },
    ],
  },
};

export function getEntityConfig(slug: string): EntityConfig | undefined {
  return entities[slug];
}
