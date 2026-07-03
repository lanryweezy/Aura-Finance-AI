const PER_DIEM_RATES: Record<string, number> = {
  'Lagos': 25000,
  'Abuja': 25000,
  'Port Harcourt': 20000,
  'Kano': 15000,
  'Ibadan': 15000,
  'Enugu': 15000,
  'Default': 15000,
};

export function calculatePerDiem(location: string, days: number): number {
  const rate = PER_DIEM_RATES[location] || PER_DIEM_RATES['Default'];
  return rate * days;
}

export function getPerDiemRate(location: string): number {
  return PER_DIEM_RATES[location] || PER_DIEM_RATES['Default'];
}

export function getAvailableLocations(): string[] {
  return Object.keys(PER_DIEM_RATES).filter(k => k !== 'Default');
}
