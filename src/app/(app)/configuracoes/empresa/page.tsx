import { requireOrg } from "@/lib/tenant";
import { RecordForm } from "@/components/crud/record-form";
import { companyProfileFields } from "./fields";
import { saveCompanyProfileAction } from "./actions";

export default async function CompanyProfilePage() {
  const { organization } = await requireOrg();

  return (
    <div>
      <h1 className="text-xl font-semibold text-neutral-900">Dados da Empresa</h1>
      <p className="mt-1 mb-6 text-sm text-neutral-500">
        Essas informações identificam a contratada nos contratos gerados pelo sistema
        (aulas, aluguel de piquete e aluguel de baia).
      </p>

      <div className="max-w-2xl">
        <RecordForm
          fields={companyProfileFields}
          action={saveCompanyProfileAction}
          initialValues={organization}
          backHref="/"
        />
      </div>
    </div>
  );
}
