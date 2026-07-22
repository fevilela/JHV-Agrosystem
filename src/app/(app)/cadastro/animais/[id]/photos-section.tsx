import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { uploadAnimalPhotoAction, deleteAnimalPhotoAction } from "../actions";
import { DeleteButton } from "@/components/crud/delete-button";

type Photo = { id: string; url: string; caption: string | null };

export async function PhotosSection({
  animalId,
  photos,
}: {
  animalId: string;
  photos: Photo[];
}) {
  const t = await getTranslations("cadastro.animais.photos");

  return (
    <div className="space-y-6">
      <form
        action={uploadAnimalPhotoAction.bind(null, animalId)}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            {t("file")}
          </label>
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="w-full text-sm"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            {t("caption")}
          </label>
          <input
            name="caption"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          {t("upload")}
        </button>
      </form>

      {photos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-sm text-neutral-400">
          {t("empty")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white"
            >
              <div className="relative aspect-square">
                <Image
                  src={photo.url}
                  alt={photo.caption || t("defaultAlt")}
                  fill
                  className="object-cover"
                />
              </div>
              {photo.caption && (
                <p className="truncate px-2 py-1 text-xs text-neutral-500">
                  {photo.caption}
                </p>
              )}
              <div className="absolute right-1 top-1 opacity-0 transition group-hover:opacity-100">
                <DeleteButton
                  onDelete={deleteAnimalPhotoAction.bind(
                    null,
                    animalId,
                    photo.id
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
