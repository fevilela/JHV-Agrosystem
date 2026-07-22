import { getTranslations } from "next-intl/server";
import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { getCompanyProfileFields } from "./fields";
import { saveCompanyProfileAction } from "./actions";

export default async function CompanyProfilePage() {
  const { organization } = await requireOrg();
  const t = await getTranslations("configuracoes.empresa");

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">{t("title")}</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-500">{t("description")}</p>

      <div className="max-w-2xl">
        <RecordForm
          fields={getCompanyProfileFields(t)}
          action={saveCompanyProfileAction}
          initialValues={organization}
          backHref="/"
        />
      </div>
    </div>
  );
}
