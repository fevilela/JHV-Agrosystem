import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export async function saveUploadedFile(file: File, subdir: string) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const ext = path.extname(file.name).slice(0, 10);
  const safeName = `${crypto.randomUUID()}${ext}`;
  await writeFile(path.join(dir, safeName), bytes);

  return {
    url: `/uploads/${subdir}/${safeName}`,
    name: file.name,
  };
}
