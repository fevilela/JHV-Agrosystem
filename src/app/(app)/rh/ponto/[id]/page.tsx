import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecordForm } from "@/components/crud/record-form";
import { getAttendanceFields } from "../fields";
import { updateAttendanceAction } from "../actions";

export default async function EditAttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [record, employees] = await Promise.all([
    prisma.attendance.findUnique({ where: { id } }),
    prisma.employee.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!record) notFound();

  const t = await getTranslations("rh.ponto");
  const tf = await getTranslations("rh.ponto.fields");
  const tStatus = await getTranslations("labels.attendanceStatus");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">{t("editTitle")}</h1>
      <RecordForm
        fields={getAttendanceFields(tf, tStatus)}
        action={updateAttendanceAction.bind(null, id)}
        initialValues={record}
        relationOptions={{
          employeeId: employees.map((e) => ({ id: e.id, label: e.name })),
        }}
        backHref="/rh/ponto"
      />
    </div>
  );
}
