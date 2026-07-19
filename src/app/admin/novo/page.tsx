import { OrganizationForm } from "../organization-form";
import { createOrganizationAction } from "../actions";

export default function NewOrganizationPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Nova Organização</h1>
      <div className="max-w-3xl">
        <OrganizationForm action={createOrganizationAction} />
      </div>
    </div>
  );
}
