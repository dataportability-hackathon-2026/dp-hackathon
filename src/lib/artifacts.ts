import { del, type ListBlobResult, list, put } from "@vercel/blob";

export async function uploadArtifact(
  file: File | Blob,
  filename: string,
  folder?: string,
): Promise<string> {
  const pathname = folder ? `${folder}/${filename}` : filename;
  const blob = await put(pathname, file, { access: "public" });
  return blob.url;
}

export async function deleteArtifact(url: string): Promise<void> {
  await del(url);
}

export async function listArtifacts(prefix?: string): Promise<ListBlobResult> {
  return list(prefix ? { prefix } : undefined);
}
