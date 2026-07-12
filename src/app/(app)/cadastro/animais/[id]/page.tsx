import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AnimalForm } from "../animal-form";
import { updateAnimalAction, deleteAnimalAction } from "../actions";
import { PhotosSection } from "./photos-section";
import { DocumentsSection } from "./documents-section";
import { Tabs } from "@/components/tabs";
import { DeleteButton } from "@/components/crud/delete-button";
import { ModulePlaceholder } from "@/components/placeholder";

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [animal, owners, animals] = await Promise.all([
    prisma.animal.findUnique({
      where: { id },
      include: {
        owner: true,
        pai: true,
        mae: true,
        photos: { orderBy: { createdAt: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        filhosComoPai: true,
        filhosComoMae: true,
      },
    }),
    prisma.owner.findMany({ orderBy: { name: "asc" } }),
    prisma.animal.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!animal) notFound();

  const filhos = [...animal.filhosComoPai, ...animal.filhosComoMae];
  const genealogyOptions = animals.filter((a) => a.id !== id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/cadastro/animais"
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            ← Animais / Cavalos
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-neutral-900">
            {animal.name}
          </h1>
        </div>
        <DeleteButton
          onDelete={deleteAnimalAction.bind(null, id)}
        />
      </div>

      <Tabs
        tabs={[
          {
            id: "dados",
            label: "Dados Gerais",
            content: (
              <AnimalForm
                action={updateAnimalAction.bind(null, id)}
                animal={animal}
                owners={owners}
                animalsForGenealogy={genealogyOptions}
                backHref="/cadastro/animais"
              />
            ),
          },
          {
            id: "genealogia",
            label: "Genealogia",
            content: (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-500">
                    Pai
                  </h3>
                  {animal.pai ? (
                    <Link
                      href={`/cadastro/animais/${animal.pai.id}`}
                      className="text-brand-800 hover:underline"
                    >
                      {animal.pai.name}
                    </Link>
                  ) : (
                    <p className="text-sm text-neutral-400">Não informado</p>
                  )}
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-500">
                    Mãe
                  </h3>
                  {animal.mae ? (
                    <Link
                      href={`/cadastro/animais/${animal.mae.id}`}
                      className="text-brand-800 hover:underline"
                    >
                      {animal.mae.name}
                    </Link>
                  ) : (
                    <p className="text-sm text-neutral-400">Não informado</p>
                  )}
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:col-span-2">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-500">
                    Filhos ({filhos.length})
                  </h3>
                  {filhos.length === 0 ? (
                    <p className="text-sm text-neutral-400">
                      Nenhum filho cadastrado
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {filhos.map((f) => (
                        <li key={f.id}>
                          <Link
                            href={`/cadastro/animais/${f.id}`}
                            className="text-sm text-brand-800 hover:underline"
                          >
                            {f.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ),
          },
          {
            id: "fotos",
            label: "Fotos",
            content: <PhotosSection animalId={id} photos={animal.photos} />,
          },
          {
            id: "documentos",
            label: "Documentos",
            content: (
              <DocumentsSection animalId={id} documents={animal.documents} />
            ),
          },
          {
            id: "saude",
            label: "Saúde / Histórico",
            content: (
              <ModulePlaceholder
                title="Saúde e Histórico Veterinário"
                description="Vacinas, vermifugação, exames, cirurgias, medicamentos e histórico completo entram no módulo Hípica, em uma próxima etapa."
              />
            ),
          },
          {
            id: "treinamento",
            label: "Treinamento",
            content: (
              <ModulePlaceholder
                title="Treinamento"
                description="Controle diário de exercícios, tempo, intensidade, salto, tambor, marcha e evolução entram no módulo Hípica, em uma próxima etapa."
              />
            ),
          },
        ]}
      />
    </div>
  );
}
