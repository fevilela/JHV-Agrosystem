import type { RecordField } from "@/components/crud/record-form";
import { toOptionsFromKeys, reproductionMethodLabels, diagnosisResultLabels } from "@/lib/labels";

type Translator = (key: string) => string;

export function getReproductionFields(
  t: Translator,
  tMethod: Translator,
  tDiagnosis: Translator
): RecordField[] {
  return [
    { name: "animalId", label: t("animalId"), type: "relation", required: true },
    {
      name: "method",
      label: t("method"),
      type: "select",
      required: true,
      options: toOptionsFromKeys(reproductionMethodLabels, tMethod),
    },
    { name: "date", label: t("date"), type: "date", required: true },
    { name: "diagnosisDate", label: t("diagnosisDate"), type: "date" },
    {
      name: "diagnosisResult",
      label: t("diagnosisResult"),
      type: "select",
      options: toOptionsFromKeys(diagnosisResultLabels, tDiagnosis),
    },
    { name: "expectedBirthDate", label: t("expectedBirthDate"), type: "date" },
    { name: "birthDate", label: t("birthDate"), type: "date" },
    { name: "weaningDate", label: t("weaningDate"), type: "date" },
    { name: "notes", label: t("notes"), type: "textarea", colSpan: 2 },
  ];
}
