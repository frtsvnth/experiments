import type { jsPDF } from 'jspdf';

export const PDF_FAMILIES = {
  body: 'Manrope',
  display: 'Cormorant',
  mono: 'PlexMono',
} as const;

const SPECS: { file: string; family: string }[] = [
  { file: 'Manrope.ttf', family: PDF_FAMILIES.body },
  { file: 'CormorantGaramond.ttf', family: PDF_FAMILIES.display },
  { file: 'IBMPlexMono-Medium.ttf', family: PDF_FAMILIES.mono },
];

const cache = new Map<string, string>();

async function fetchBase64(file: string): Promise<string> {
  const cached = cache.get(file);
  if (cached) return cached;
  const url = `${import.meta.env.BASE_URL}fonts/${file}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Не удалось загрузить шрифт ${file}`);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + chunk)));
  }
  const encoded = btoa(binary);
  cache.set(file, encoded);
  return encoded;
}

export async function prepareFontsForDocument(doc: jsPDF): Promise<void> {
  const loaded = await Promise.all(SPECS.map((spec) => fetchBase64(spec.file)));
  SPECS.forEach((spec, index) => {
    doc.addFileToVFS(spec.file, loaded[index]);
    doc.addFont(spec.file, spec.family, 'normal');
    doc.addFont(spec.file, spec.family, 'bold');
  });
}
