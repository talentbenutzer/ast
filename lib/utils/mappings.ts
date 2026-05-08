export const MOEBEL_MAP: Record<string, string> = {
  LF1: "Work",
  LF2: "Long",
  LF3: "Low",
  LF4: "High",
};

export const FARBE_MAP: Record<string, string> = {
  "01": "Earth",
  "02": "Dust",
  "03": "Shadow",
  "04": "Ocean",
  "05": "Plant",
  "06": "Stone",
  "07": "Chocolate",
};

export const GESTELL_MAP: Record<string, string> = {
  "00A": "Bronze",
  "00B": "Industriell",
};

export const KUNDE_MAP: Record<string, string> = {
  "01": "Retail",
  "02": "Privat",
};

export const ARTEDITION_MAP: Record<string, string> = {
  XX: "Keine",
  AE: "One of Hundred",
};

export function decodeFurniture(code: string) {
  return MOEBEL_MAP[code] || code;
}

export function decodeColor(code: string) {
  return FARBE_MAP[code] || code;
}

export function decodeFrame(code: string) {
  return GESTELL_MAP[code] || code;
}

export function decodeCustomerType(code: string) {
  return KUNDE_MAP[code] || code;
}

export function decodeArtedition(code: string) {
  return ARTEDITION_MAP[code] || code;
}
