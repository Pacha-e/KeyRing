// --- Exported members ---
export class PropertyFormatter {
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      currency: 'COP',
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(amount);
  }
}
