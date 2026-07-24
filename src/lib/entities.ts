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
    | "property"
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

type T = (key: string) => string;

export function getEntities(t: T): Record<string, EntityConfig> {
  const f = (key: string) => t(`fields.${key}`);
  const e = (slug: string, key: string) => t(`entities.${slug}.${key}`);

  const personBase: EntityField[] = [
    { name: "name", label: f("name"), type: "text", required: true, colSpan: 2 },
    { name: "cpfCnpj", label: f("cpfCnpj"), type: "text" },
    { name: "phone", label: f("phone"), type: "tel" },
    { name: "email", label: f("email"), type: "email" },
    { name: "address", label: f("address"), type: "text", colSpan: 2 },
    { name: "city", label: f("city"), type: "text" },
    { name: "state", label: f("state"), type: "text" },
    { name: "notes", label: f("notes"), type: "textarea", colSpan: 2 },
  ];

  const staffBase: EntityField[] = [
    { name: "name", label: f("name"), type: "text", required: true, colSpan: 2 },
    { name: "cpf", label: f("cpf"), type: "text" },
    { name: "phone", label: f("phone"), type: "tel" },
    { name: "email", label: f("email"), type: "email" },
    { name: "active", label: f("active"), type: "checkbox" },
    { name: "notes", label: f("notes"), type: "textarea", colSpan: 2 },
  ];

  return {
    propriedades: {
      slug: "propriedades",
      model: "property",
      title: e("propriedades", "title"),
      singular: e("propriedades", "singular"),
      fields: [
        { name: "name", label: f("name"), type: "text", required: true, colSpan: 2 },
        { name: "code", label: f("code"), type: "text" },
        { name: "notes", label: f("notes"), type: "textarea", colSpan: 2 },
      ],
      listColumns: [
        { key: "name", label: f("name") },
        { key: "code", label: f("code") },
      ],
    },
    proprietarios: {
      slug: "proprietarios",
      model: "owner",
      title: e("proprietarios", "title"),
      singular: e("proprietarios", "singular"),
      fields: personBase,
      listColumns: [
        { key: "name", label: f("name") },
        { key: "cpfCnpj", label: f("cpfCnpj") },
        { key: "phone", label: f("phone") },
        { key: "city", label: f("city") },
      ],
    },
    clientes: {
      slug: "clientes",
      model: "client",
      title: e("clientes", "title"),
      singular: e("clientes", "singular"),
      fields: [
        { name: "name", label: f("name"), type: "text", required: true, colSpan: 2 },
        { name: "cpfCnpj", label: f("cpfCnpj"), type: "text" },
        { name: "phone", label: f("phone"), type: "tel" },
        { name: "email", label: f("email"), type: "email" },
        { name: "address", label: f("streetAddress"), type: "text", colSpan: 2 },
        { name: "streetNumber", label: f("streetNumber"), type: "text" },
        { name: "neighborhood", label: f("neighborhood"), type: "text" },
        { name: "zipCode", label: f("zipCode"), type: "text" },
        { name: "city", label: f("city"), type: "text" },
        { name: "state", label: f("state"), type: "text" },
        { name: "notes", label: f("notes"), type: "textarea", colSpan: 2 },
      ],
      listColumns: [
        { key: "name", label: f("name") },
        { key: "cpfCnpj", label: f("cpfCnpj") },
        { key: "phone", label: f("phone") },
        { key: "city", label: f("city") },
      ],
    },
    fornecedores: {
      slug: "fornecedores",
      model: "supplier",
      title: e("fornecedores", "title"),
      singular: e("fornecedores", "singular"),
      fields: [
        ...personBase.slice(0, -1),
        {
          name: "productsOrServices",
          label: f("productsOrServices"),
          type: "text",
          colSpan: 2,
        },
        { name: "notes", label: f("notes"), type: "textarea", colSpan: 2 },
      ],
      listColumns: [
        { key: "name", label: f("name") },
        { key: "cpfCnpj", label: f("cpfCnpj") },
        { key: "phone", label: f("phone") },
        { key: "productsOrServices", label: f("productsOrServices") },
      ],
    },
    funcionarios: {
      slug: "funcionarios",
      model: "employee",
      title: e("funcionarios", "title"),
      singular: e("funcionarios", "singular"),
      fields: [
        { name: "name", label: f("name"), type: "text", required: true, colSpan: 2 },
        { name: "cpf", label: f("cpf"), type: "text" },
        { name: "role", label: f("role"), type: "text" },
        { name: "phone", label: f("phone"), type: "tel" },
        { name: "email", label: f("email"), type: "email" },
        { name: "address", label: f("address"), type: "text", colSpan: 2 },
        { name: "admissionDate", label: f("admissionDate"), type: "date" },
        { name: "salary", label: f("salary"), type: "number" },
        { name: "active", label: f("active"), type: "checkbox" },
        { name: "notes", label: f("notes"), type: "textarea", colSpan: 2 },
      ],
      listColumns: [
        { key: "name", label: f("name") },
        { key: "role", label: f("role") },
        { key: "phone", label: f("phone") },
        { key: "active", label: f("active") },
      ],
    },
    veterinarios: {
      slug: "veterinarios",
      model: "veterinarian",
      title: e("veterinarios", "title"),
      singular: e("veterinarios", "singular"),
      fields: [
        { name: "name", label: f("name"), type: "text", required: true, colSpan: 2 },
        { name: "cpf", label: f("cpf"), type: "text" },
        { name: "crmv", label: f("crmv"), type: "text" },
        { name: "phone", label: f("phone"), type: "tel" },
        { name: "email", label: f("email"), type: "email" },
        { name: "specialty", label: f("specialty"), type: "text" },
        { name: "active", label: f("active"), type: "checkbox" },
        { name: "notes", label: f("notes"), type: "textarea", colSpan: 2 },
      ],
      listColumns: [
        { key: "name", label: f("name") },
        { key: "crmv", label: f("crmv") },
        { key: "specialty", label: f("specialty") },
        { key: "phone", label: f("phone") },
      ],
    },
    ferradores: {
      slug: "ferradores",
      model: "farrier",
      title: e("ferradores", "title"),
      singular: e("ferradores", "singular"),
      fields: staffBase,
      listColumns: [
        { key: "name", label: f("name") },
        { key: "phone", label: f("phone") },
        { key: "email", label: f("email") },
        { key: "active", label: f("active") },
      ],
    },
    instrutores: {
      slug: "instrutores",
      model: "instructor",
      title: e("instrutores", "title"),
      singular: e("instrutores", "singular"),
      fields: [
        { name: "name", label: f("name"), type: "text", required: true, colSpan: 2 },
        { name: "cpf", label: f("cpf"), type: "text" },
        { name: "phone", label: f("phone"), type: "tel" },
        { name: "email", label: f("email"), type: "email" },
        { name: "specialty", label: f("specialty"), type: "text" },
        { name: "active", label: f("active"), type: "checkbox" },
        { name: "notes", label: f("notes"), type: "textarea", colSpan: 2 },
      ],
      listColumns: [
        { key: "name", label: f("name") },
        { key: "specialty", label: f("specialty") },
        { key: "phone", label: f("phone") },
        { key: "active", label: f("active") },
      ],
    },
    tratadores: {
      slug: "tratadores",
      model: "handler",
      title: e("tratadores", "title"),
      singular: e("tratadores", "singular"),
      fields: staffBase,
      listColumns: [
        { key: "name", label: f("name") },
        { key: "phone", label: f("phone") },
        { key: "email", label: f("email") },
        { key: "active", label: f("active") },
      ],
    },
  };
}

export function getEntityConfig(slug: string, t: T): EntityConfig | undefined {
  return getEntities(t)[slug];
}
