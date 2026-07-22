import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getAttendanceFields } from "../fields";
import { createAttendanceAction } from "../actions";

export default async function NewAttendancePage() {
  const { organizationId } = await requireOrg();
  const employees = await prisma.employee.findMany({ where: { organizationId }, orderBy: { name: "asc" } });

  const t = await getTranslations("rh.ponto");
  const tf = await getTranslations("rh.ponto.fields");
  const tStatus = await getTranslations("labels.attendanceStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("newTitle")}</h1>
      <RecordForm
        fields={getAttendanceFields(tf, tStatus)}
        action={createAttendanceAction}
        initialValues={{ status: "PRESENTE" }}
        relationOptions={{
          employeeId: employees.map((e) => ({ id: e.id, label: e.name })),
        }}
        backHref="/rh/ponto"
        offline={{ moduleLabel: t("title"), syncEndpoint: "/api/sync/ponto" }}
      />
    </div>
  );
}
