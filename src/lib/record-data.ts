import type { RecordField } from "@/components/crud/record-form";

function parseValue(field: RecordField, raw: FormDataEntryValue | null) {
  if (field.type === "checkbox") {
    return raw === "on" || raw === "true";
  }
  const value = typeof raw === "string" ? raw.trim() : "";
  if (value === "") return null;
  if (field.type === "number") return Number(value);
  if (field.type === "date") return new Date(value);
  return value;
}

export function buildRecordData(fields: RecordField[], formData: FormData) {
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    data[field.name] = parseValue(field, formData.get(field.name));
  }
  return data;
}
