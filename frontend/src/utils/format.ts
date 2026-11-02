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
