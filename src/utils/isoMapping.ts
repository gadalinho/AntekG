// Mapowanie ISO alpha-2 → numeryczny kod TopoJSON (ISO 3166-1 numeric)
// Używane do podświetlania krajów na mapie react-simple-maps
export const ISO_TO_NUMERIC: Record<string, number> = {
  PL: 616,
  FR: 250,
  IT: 380,
  DE: 276,
  GB: 826,
  JP: 392,
  CN: 156,
  IN: 356,
  TH: 764,
  AE: 784,
  EG: 818,
  ZA: 710,
  KE: 404,
  MA: 504,
  TZ: 834,
  US: 840,
  MX: 484,
  CA: 124,
  CU: 192,
  CR: 188,
  BR: 76,
  AR: 32,
  PE: 604,
  CO: 170,
  CL: 152,
  AU: 36,
  NZ: 554,
  FJ: 242,
  PG: 598,
  WS: 882,
};

// Mapowanie numeru → ISO alpha-2 (odwrotne)
export const NUMERIC_TO_ISO: Record<number, string> = Object.fromEntries(
  Object.entries(ISO_TO_NUMERIC).map(([k, v]) => [v, k])
);

export const CONTINENT_COLORS: Record<string, string> = {
  Europa: '#4A90D9',
  Azja: '#E8A838',
  Afryka: '#D4703A',
  'Ameryka Północna': '#5AAF6E',
  'Ameryka Południowa': '#3FB8AF',
  'Australia i Oceania': '#9B6DD4',
};
