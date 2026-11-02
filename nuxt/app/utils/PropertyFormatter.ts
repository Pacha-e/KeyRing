// --- Exported members ---
// Static classes are required by the course architecture.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PropertyFormatter {
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      currency: 'COP',
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(amount);
  }
}
