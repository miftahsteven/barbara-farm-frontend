/**
 * KTP SAPI - Cattle Identification Code Generator
 * Format: BF-{DAM_CODE}-{BREED_CODE}-{GENDER_CODE}-{BIRTH_MONTH}-{BIRTH_YEAR}({ALIAS})
 * Example: BF-A01-BLIX-J-7-25 (BIXO)
 */

export interface KtpSapiInput {
  damCode: string;        // Alias indukan (e.g. MAMI, BELI) or 'EXT' if no dam
  breed: string;          // Ras/Jenis (e.g. Bali, Limousin, BaliCross)
  gender: 'JANTAN' | 'BETINA';
  birthDate: Date;
  alias: string;          // Nama panggilan di lapangan
}

export const DEFAULT_DAM_CODE = 'EXT'; // External - sapi masuk dari luar (beli/hibah)

export interface KtpSapiResult {
  fullCode: string;       // Full KTP code
  parts: {
    farmCode: string;     // BF
    damCode: string;      // A01
    breedCode: string;    // BLIX
    genderCode: string;   // J atau B
    birthMonth: string;   // 7
    birthYear: string;    // 25
    alias: string;        // BIXO
  };
}

const BREED_CODE_MAP: Record<string, string> = {
  'Bali':                'BALI',
  'Bali Cross':          'BLIX',
  'Limousin':            'LIMS',
  'Limousin Cross':      'LIMX',
  'Simental':            'SIMT',
  'Simental Cross':      'SIMX',
  'PO (Peranakan Ongole)': 'PO',
  'Peranakan Ongole':    'PO',
  'Brahman':             'BRHM',
  'Brahman Cross':       'BRHX',
  'Angus':               'ANGS',
  'Angus Cross':         'ANGX',
  'FH (Friesian Holstein)': 'FH',
};

function getBreedCode(breed: string): string {
  return BREED_CODE_MAP[breed] || breed.slice(0, 4).toUpperCase();
}

export function generateKtpSapi(input: KtpSapiInput): KtpSapiResult {
  const farmCode = 'BF';
  const damCode = (input.damCode || DEFAULT_DAM_CODE).toUpperCase();
  const breedCode = getBreedCode(input.breed || '');
  const genderCode = input.gender === 'JANTAN' ? 'J' : 'B';
  const birthMonth = String(input.birthDate ? input.birthDate.getMonth() + 1 : 1);
  const birthYear = String(input.birthDate ? input.birthDate.getFullYear() : new Date().getFullYear()).slice(-2);
  const alias = (input.alias || '').toUpperCase().replace(/\s+/g, '').slice(0, 6);

  const fullCode = `${farmCode}-${damCode}-${breedCode}-${genderCode}-${birthMonth}-${birthYear} (${alias})`;

  return {
    fullCode,
    parts: {
      farmCode,
      damCode,
      breedCode,
      genderCode,
      birthMonth,
      birthYear,
      alias,
    }
  };
}

export function parseKtpSapi(code: string): Partial<KtpSapiInput> | null {
  // Format: BF-A01-BLIX-J-7-25 (BIXO)
  const match = code.match(/^BF-([A-Z0-9]+)-([A-Z]+)-([JB])-(\d{1,2})-(\d{2})\s*\(([^)]+)\)$/);
  if (!match) return null;

  const [, damCode, breedCode, genderCode, month, year, alias] = match;

  const reverseBreed = Object.entries(BREED_CODE_MAP).find(([, code]) => code === breedCode)?.[0] || breedCode;
  const fullYear = 2000 + parseInt(year);
  const birthDate = new Date(fullYear, parseInt(month) - 1, 1);

  return {
    damCode,
    breed: reverseBreed,
    gender: genderCode === 'J' ? 'JANTAN' : 'BETINA',
    birthDate,
    alias,
  };
}

export const BREED_OPTIONS = Object.keys(BREED_CODE_MAP);
