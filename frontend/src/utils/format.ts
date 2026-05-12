export const formatDate = (date?: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (date?: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export function isSpanishFeminine(word: string): boolean {
  const normalizedWord = word.toLowerCase().trim();

  // 1. Known Exceptions (Words ending in -o that are feminine)
  const femExceptions = ["mano", "foto", "radio", "moto"];
  if (femExceptions.includes(normalizedWord)) return true;

  // 2. Common Feminine Endings
  const femEndings = ["a", "cion", "sion", "ción", "sión", "dad", "tad", "tud", "umbre", "ie", "z"];
  if (femEndings.some(ending => normalizedWord.endsWith(ending))) {

    // 3. Known Masculine Exceptions ending in -a
    const mascExceptions = ["día", "dia", "mapa", "sofá", "sofa", "problema", "sistema", "idioma", "planeta"];
    if (mascExceptions.includes(normalizedWord)) return false;

    return true;
  }

  // 4. Other words are typically masculine
  return false;
}

export function getDaysDiff(d1: Date, d2: Date): number {
  const msInDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs(d1.getTime() - d2.getTime()) / msInDay);
}

export const formatPhone = (value?: string): string => {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)} ${digits.slice(10)}`;
};