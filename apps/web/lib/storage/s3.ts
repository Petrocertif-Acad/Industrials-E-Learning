import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.STORAGE_BUCKET;

export const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

function getClient() {
  return new S3Client({
    endpoint: process.env.STORAGE_ENDPOINT,
    region: process.env.STORAGE_REGION,
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
    },
  });
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
}

export function buildDocumentStorageKey(technicianId: string, category: string, fileName: string) {
  return `technicians/${technicianId}/${category}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
}

export function validateDocumentFile(file: File): string | null {
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
    return "Format de fichier non autorisé (PDF, JPG ou PNG uniquement).";
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return "Le fichier dépasse la taille maximale autorisée (10 Mo).";
  }
  return null;
}

export async function uploadDocumentObject(key: string, body: Buffer, contentType: string) {
  const client = getClient();
  await client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType })
  );
}

export async function deleteDocumentObject(key: string) {
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

// Les documents ne sont jamais exposés via une URL publique permanente : ce
// lien signé expire rapidement et doit être régénéré à chaque consultation
// (voir app/api/documents/[id]/download/route.ts).
export async function getSignedDocumentUrl(key: string, expiresInSeconds = 300) {
  const client = getClient();
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });

  const internalEndpoint = process.env.STORAGE_ENDPOINT;
  const publicEndpoint = process.env.STORAGE_PUBLIC_ENDPOINT;
  if (!internalEndpoint || !publicEndpoint || internalEndpoint === publicEndpoint) {
    return url;
  }

  // Le SDK signe l'URL avec l'hôte interne au réseau Docker (ex. "minio:9000"),
  // injoignable depuis le navigateur de l'utilisateur : on réécrit uniquement
  // l'origine vers l'hôte public, sans toucher à la signature (query string).
  const rewritten = new URL(url);
  const publicUrl = new URL(publicEndpoint);
  rewritten.protocol = publicUrl.protocol;
  rewritten.host = publicUrl.host;
  return rewritten.toString();
}
