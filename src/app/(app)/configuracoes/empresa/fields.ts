import type { RecordField } from "@/components/crud/record-form";

export const companyProfileFields: RecordField[] = [
  { name: "name", label: "Razão Social / Nome", type: "text", required: true, colSpan: 2 },
  { name: "cpfCnpj", label: "CPF/CNPJ", type: "text" },
  { name: "phone", label: "Telefone", type: "text" },
  { name: "email", label: "E-mail", type: "text" },
  { name: "zipCode", label: "CEP", type: "text" },
  { name: "address", label: "Endereço", type: "text" },
  { name: "streetNumber", label: "Número", type: "text" },
  { name: "neighborhood", label: "Bairro", type: "text" },
  { name: "city", label: "Cidade", type: "text" },
  { name: "state", label: "UF", type: "text" },
];
