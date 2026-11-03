// --- Exported members ---
export class CurrencyFormatter {
  static formatCOP(amount: number): string {
    return amount.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  }

  static formatNumber(value: number): string {
    return value.toLocaleString('es-CO', { maximumFractionDigits: 0 });
  }
}

export class DateFormatter {
  static bogotaDate(date = new Date()): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value;
    return `${value('year')}-${value('month')}-${value('day')}`;
  }
}
