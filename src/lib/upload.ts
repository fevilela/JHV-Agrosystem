import crypto from "node:crypto";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "uploads";

// Bucket público — mesmo nível de proteção que o disco local anterior tinha (arquivo só
// "protegido" por ter um nome aleatório na URL, sem autenticação). Se no futuro quiser
// endurecer isso, trocar pra bucket privado + `createSignedUrl` no lugar de `getPublicUrl`
// abaixo — nesse caso os callers passariam a precisar guardar o caminho do objeto em vez da
// URL pública direta, já que a URL assinada expira.
function getStorageClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configurados — ver docs/SETUP.md."
    );
  }
  // Service role key ignora as RLS policies de usuário do Storage — necessário porque o upload
  // roda em server action sem sessão de usuário Supabase Auth (autenticação é via NextAuth).
  // Nunca expor essa chave no client.
  return createClient(url, serviceRoleKey);
}

export async function saveUploadedFile(file: File, subdir: string) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name).slice(0, 10);
  const safeName = `${crypto.randomUUID()}${ext}`;
  const objectPath = `${subdir}/${safeName}`;

  const supabase = getStorageClient();
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new Error(`Falha ao enviar arquivo para o Storage: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);

  return {
    url: publicUrl,
    name: file.name,
  };
}

// Remove o objeto do bucket a partir da URL pública salva no banco (AnimalPhoto.url /
// AnimalDocument.url). Sem isso, arquivos excluídos só pelo registro do banco continuam
// se acumulando no Storage pra sempre.
export async function deleteUploadedFile(url: string) {
  const objectPath = extractObjectPath(url);
  if (!objectPath) return;

  const supabase = getStorageClient();
  const { error } = await supabase.storage.from(BUCKET).remove([objectPath]);
  if (error) throw new Error(`Falha ao excluir arquivo do Storage: ${error.message}`);
}

// Pura — separada do client do Storage pra dar pra testar sem mockar o Supabase inteiro.
export function extractObjectPath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}
