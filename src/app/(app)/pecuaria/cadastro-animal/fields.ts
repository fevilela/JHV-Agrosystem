import type { RecordField } from "@/components/crud/record-form";
import {
  toOptionsFromKeys,
  animalSexoLabels,
  livestockCategoryLabels,
  livestockStatusLabels,
} from "@/lib/labels";

type Translator = (key: string) => string;

export function getLivestockAnimalFields(
  t: Translator,
  tSexo: Translator,
  tCategory: Translator,
  tStatus: Translator
): RecordField[] {
  return [
    { name: "brinco", label: t("brinco"), type: "text", required: true },
    { name: "rfid", label: t("rfid"), type: "text" },
    { name: "name", label: t("name"), type: "text" },
    {
      name: "sexo",
      label: t("sexo"),
      type: "select",
      options: toOptionsFromKeys(animalSexoLabels, tSexo),
    },
    { name: "raca", label: t("raca"), type: "text" },
    {
      name: "category",
      label: t("category"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(livestockCategoryLabels, tCategory),
    },
    { name: "dataNascimento", label: t("dataNascimento"), type: "date" },
    { name: "pesoAtual", label: t("pesoAtual"), type: "number" },
    {
      name: "status",
      label: t("status"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(livestockStatusLabels, tStatus),
    },
    { name: "loteId", label: t("loteId"), type: "relation" },
    { name: "pastureId", label: t("pastureId"), type: "relation" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
