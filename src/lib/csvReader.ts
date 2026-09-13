/**
 * CSV Reader & Encoding Helper for Prospecta
 *
 * Automatically detects file encoding (UTF-8 with/without BOM, Windows-1252 / ANSI, ISO-8859-1),
 * decodes French and West African accents (é, è, à, ô, ê, ç, •, etc.) without corruption,
 * repairs common mojibake/garbled text, and produces a clean UTF-8 File for backend ingestion.
 */

// 1. Common French Mojibake replacement map (when UTF-8 bytes were misread as Latin-1)
const MOJIBAKE_MAP: Array<[RegExp, string]> = [
  [/Ã©/g, 'é'],
  [/Ã¨/g, 'è'],
  [/Ã /g, 'à'],
  [/Ã¢/g, 'â'],
  [/Ãª/g, 'ê'],
  [/Ã«/g, 'ë'],
  [/Ã®/g, 'î'],
  [/Ã¯/g, 'ï'],
  [/Ã´/g, 'ô'],
  [/Ã¹/g, 'ù'],
  [/Ã»/g, 'û'],
  [/Ã§/g, 'ç'],
  [/Ã‰/g, 'É'],
  [/Ãˆ/g, 'È'],
  [/Ã€/g, 'À'],
  [/Ã‚/g, 'Â'],
  [/ÃŠ/g, 'Ê'],
  [/ÃŽ/g, 'Î'],
  [/Ã”/g, 'Ô'],
  [/Ã™/g, 'Ù'],
  [/Ã‡/g, 'Ç'],
  [/â€™/g, "'"],
  [/â€“/g, '–'],
  [/â€”/g, '—'],
  [/Â«/g, '«'],
  [/Â»/g, '»'],
  [/â€¢/g, '•'],
  [/Â°/g, '°'],
  [/â‚¬/g, '€'],
];

/**
 * Fixes double-encoded UTF-8 or Latin-1 mojibake in a string.
 */
export function fixMojibake(text: string): string {
  if (!text) return text;
  let fixed = text;
  for (const [regex, replacement] of MOJIBAKE_MAP) {
    fixed = fixed.replace(regex, replacement);
  }
  return fixed;
}

/**
 * Repairs strings where accented characters were replaced by the Unicode replacement character (\uFFFD / )
 * or stripped in common West African / French business terms.
 */
export function repairGarbledAccents(text: string): string {
  if (!text) return text;
  let s = fixMojibake(text);

  // Common pattern replacements where \uFFFD () or missing accent exists
  s = s
    // Opérations
    .replace(/Op[\uFFFD?]rations/gi, 'Opérations')
    .replace(/\bOperations\b/g, 'Opérations')
    // Sénégal
    .replace(/S[\uFFFD?]n[\uFFFD?]gal/gi, 'Sénégal')
    .replace(/\bSenegal\b/g, 'Sénégal')
    // Général
    .replace(/G[\uFFFD?]n[\uFFFD?]ral/gi, 'Général')
    .replace(/\bGeneral\b/g, 'Général')
    // Côte d'Ivoire
    .replace(/C[\uFFFD?]te d'Ivoire/gi, "Côte d'Ivoire")
    // Bénin
    .replace(/B[\uFFFD?]nin/gi, 'Bénin')
    // Décideur
    .replace(/D[\uFFFD?]cideur/gi, 'Décideur')
    // Développeur
    .replace(/D[\uFFFD?]veloppeur/gi, 'Développeur')
    // Qualifié
    .replace(/Qualifi[\uFFFD?]/gi, 'Qualifié')
    // Société
    .replace(/Soci[\uFFFD?]t[\uFFFD?]/gi, 'Société')
    // Télécoms / Téléphone
    .replace(/T[\uFFFD?]l[\uFFFD?]phone/gi, 'Téléphone')
    .replace(/T[\uFFFD?]l[\uFFFD?]coms/gi, 'Télécoms')
    .replace(/T[\uFFFD?]l[\uFFFD?]communications/gi, 'Télécommunications')
    // Thiès
    .replace(/Thi[\uFFFD?]s/gi, 'Thiès')
    // Numéro
    .replace(/Num[\uFFFD?]ro/gi, 'Numéro')
    // Activité
    .replace(/Activit[\uFFFD?]/gi, 'Activité')
    // Créé
    .replace(/Cr[\uFFFD?][\uFFFD?]/gi, 'Créé')
    // Intéressé
    .replace(/Int[\uFFFD?]ress[\uFFFD?]/gi, 'Intéressé')
    // Prénom
    .replace(/Pr[\uFFFD?]nom/gi, 'Prénom');

  return s;
}

/**
 * Reads a File object and decodes it using the appropriate encoding:
 * - Checks BOM (UTF-8, UTF-16)
 * - Tries strict UTF-8
 * - Falls back to Windows-1252 / ISO-8859-1 (standard for French Excel exports on Windows)
 * - Returns the clean decoded text and a new UTF-8 File with BOM ready for backend ingestion.
 */
export async function readCsvFileWithEncoding(file: File): Promise<{
  text: string;
  cleanUtf8File: File;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier.'));
    };

    reader.onload = () => {
      try {
        const buffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer);
        let decodedText = '';

        // 1. Check UTF-8 BOM (0xEF, 0xBB, 0xBF)
        if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
          decodedText = new TextDecoder('utf-8').decode(bytes.subarray(3));
        }
        // 2. Check UTF-16 LE BOM (0xFF, 0xFE)
        else if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
          decodedText = new TextDecoder('utf-16le').decode(bytes.subarray(2));
        }
        // 3. Check UTF-16 BE BOM (0xFE, 0xFF)
        else if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
          decodedText = new TextDecoder('utf-16be').decode(bytes.subarray(2));
        } else {
          // 4. Try strict UTF-8 decoding.
          // If the file is Windows-1252 with bytes like 0xE9 ('é'), strict UTF-8 throws TypeError!
          try {
            const strictUtf8 = new TextDecoder('utf-8', { fatal: true });
            decodedText = strictUtf8.decode(bytes);
          } catch {
            // 5. Fall back to Windows-1252 (ANSI / Excel French Windows standard)
            try {
              const win1252 = new TextDecoder('windows-1252');
              decodedText = win1252.decode(bytes);
            } catch {
              const isoDecoder = new TextDecoder('iso-8859-1');
              decodedText = isoDecoder.decode(bytes);
            }
          }
        }

        // Apply any mojibake and accent repairs
        decodedText = repairGarbledAccents(decodedText);

        // Create a guaranteed clean UTF-8 File with UTF-8 BOM so backend Spring Boot reads it perfectly
        const utf8Bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        const utf8Content = new TextEncoder().encode(decodedText);
        const utf8Blob = new Blob([utf8Bom, utf8Content], {
          type: 'text/csv;charset=utf-8',
        });

        const cleanUtf8File = new File([utf8Blob], file.name, {
          type: 'text/csv;charset=utf-8',
          lastModified: file.lastModified || Date.now(),
        });

        resolve({ text: decodedText, cleanUtf8File });
      } catch (err) {
        reject(err);
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Splits a single CSV line into tokens, respecting quotes and delimiters.
 */
function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''));
  return result;
}

/**
 * Detects the most probable delimiter (; , \t).
 */
function detectDelimiter(firstLines: string[]): string {
  let commaCount = 0;
  let semiCount = 0;
  let tabCount = 0;

  for (const line of firstLines) {
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') inQuotes = !inQuotes;
      if (!inQuotes) {
        if (c === ',') commaCount++;
        else if (c === ';') semiCount++;
        else if (c === '\t') tabCount++;
      }
    }
  }

  if (semiCount >= commaCount && semiCount >= tabCount && semiCount > 0) return ';';
  if (tabCount > commaCount && tabCount > semiCount) return '\t';
  return ',';
}

export interface ParsedCsvProspectRow {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  jobTitle: string;
  city: string;
  sector: string;
}

/**
 * Normalizes a header string for fuzzy matching (lowercase, no accents, no underscores/dashes).
 */
function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s\-_]/g, '');
}

/**
 * Parses CSV text into structured prospect rows with automatic column header detection.
 */
export function parseProspectCsv(text: string): {
  rows: ParsedCsvProspectRow[];
  totalRows: number;
} {
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length === 0) {
    return { rows: [], totalRows: 0 };
  }

  const delimiter = detectDelimiter(rawLines.slice(0, 5));
  const rawHeaderCols = splitCsvLine(rawLines[0], delimiter);

  // Check if line 0 looks like a header row
  const headerMap: Record<string, number> = {};
  let hasHeader = false;

  rawHeaderCols.forEach((col, idx) => {
    const norm = normalizeHeader(col);
    if (['prenom', 'firstname', 'first'].includes(norm)) {
      headerMap.firstName = idx;
      hasHeader = true;
    } else if (['nom', 'lastname', 'last', 'nomdefamille'].includes(norm)) {
      headerMap.lastName = idx;
      hasHeader = true;
    } else if (['contact', 'nomcomplet', 'fullname', 'name'].includes(norm)) {
      headerMap.fullName = idx;
      hasHeader = true;
    } else if (['email', 'mail', 'courriel', 'emailaddress'].includes(norm)) {
      headerMap.email = idx;
      hasHeader = true;
    } else if (['phone', 'telephone', 'tel', 'mobile', 'portable', 'whatsapp'].includes(norm)) {
      headerMap.phone = idx;
      hasHeader = true;
    } else if (['entreprise', 'societe', 'company', 'compagnie', 'organisation', 'boite'].includes(norm)) {
      headerMap.companyName = idx;
      hasHeader = true;
    } else if (['poste', 'fonction', 'titre', 'job', 'jobtitle', 'title', 'role'].includes(norm)) {
      headerMap.jobTitle = idx;
      hasHeader = true;
    } else if (['ville', 'city', 'region', 'pays', 'country'].includes(norm)) {
      headerMap.city = idx;
      hasHeader = true;
    } else if (['secteur', 'sector', 'industrie', 'industry', 'domaine', 'activite'].includes(norm)) {
      headerMap.sector = idx;
      hasHeader = true;
    }
  });

  const dataLines = hasHeader ? rawLines.slice(1) : rawLines;
  const rows: ParsedCsvProspectRow[] = [];

  for (let idx = 0; idx < dataLines.length; idx++) {
    const line = dataLines[idx];
    const cols = splitCsvLine(line, delimiter);
    if (cols.length === 0 || cols.every((c) => c.length === 0)) continue;

    let firstName = '';
    let lastName = '';
    let email = '';
    let phone = '';
    let companyName = '';
    let jobTitle = '';
    let city = 'Dakar';
    let sector = 'Technologies & B2B';

    if (hasHeader) {
      if (headerMap.firstName !== undefined && cols[headerMap.firstName]) {
        firstName = cols[headerMap.firstName];
      }
      if (headerMap.lastName !== undefined && cols[headerMap.lastName]) {
        lastName = cols[headerMap.lastName];
      }
      if (!firstName && !lastName && headerMap.fullName !== undefined && cols[headerMap.fullName]) {
        const parts = cols[headerMap.fullName].split(/\s+/);
        firstName = parts[0] || 'Contact';
        lastName = parts.slice(1).join(' ') || `${idx + 1}`;
      }
      if (headerMap.email !== undefined && cols[headerMap.email]) {
        email = cols[headerMap.email];
      }
      if (headerMap.phone !== undefined && cols[headerMap.phone]) {
        phone = cols[headerMap.phone];
      }
      if (headerMap.companyName !== undefined && cols[headerMap.companyName]) {
        companyName = cols[headerMap.companyName];
      }
      if (headerMap.jobTitle !== undefined && cols[headerMap.jobTitle]) {
        jobTitle = cols[headerMap.jobTitle];
      }
      if (headerMap.city !== undefined && cols[headerMap.city]) {
        city = cols[headerMap.city];
      }
      if (headerMap.sector !== undefined && cols[headerMap.sector]) {
        sector = cols[headerMap.sector];
      }
    } else {
      // Positional fallback
      firstName = cols[0] || `Contact`;
      lastName = cols[1] || `${idx + 1}`;
      email = cols[2] || `contact${idx + 1}@entreprise.sn`;
      phone = cols[3] || '+221 77 000 00 00';
      companyName = cols[4] || 'Entreprise Importée';
      jobTitle = cols[5] || 'Décideur';
      if (cols[6]) city = cols[6];
      if (cols[7]) sector = cols[7];
    }

    // Default fallbacks if empty
    if (!firstName && !lastName) {
      firstName = `Contact`;
      lastName = `${idx + 1}`;
    } else if (!firstName) {
      firstName = 'Contact';
    }

    if (!email && !phone) {
      email = `contact${idx + 1}@entreprise.sn`;
    }

    if (!companyName) companyName = 'Entreprise';
    if (!jobTitle) jobTitle = 'Décideur';

    // Repair any accents on each field
    rows.push({
      firstName: repairGarbledAccents(firstName),
      lastName: repairGarbledAccents(lastName),
      email: email.toLowerCase().trim(),
      phone: repairGarbledAccents(phone),
      companyName: repairGarbledAccents(companyName),
      jobTitle: repairGarbledAccents(jobTitle),
      city: repairGarbledAccents(city),
      sector: repairGarbledAccents(sector),
    });
  }

  return {
    rows,
    totalRows: rows.length,
  };
}
