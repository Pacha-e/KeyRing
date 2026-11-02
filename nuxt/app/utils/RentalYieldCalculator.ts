// --- Internal imports ---
import type { RentalYieldInput } from '../interfaces/RentalYieldInput';
import type { RentalYieldResult } from '../interfaces/RentalYieldResult';

// --- Exported members ---
export class RentalYieldCalculator {
  static calculate(input: RentalYieldInput): RentalYieldResult {
    const error = this.validate(input);
    if (error) throw new Error(error);

    const annualNetIncome =
      input.monthlyRent * (12 - input.vacancyMonths) -
      (input.monthlyAdminFee + input.otherMonthlyFixedCosts) * 12;
    return {
      annualNetIncome,
      grossYield: ((input.monthlyRent * 12) / input.propertyPrice) * 100,
      netYield: (annualNetIncome / input.propertyPrice) * 100,
    };
  }

  static validate(input: RentalYieldInput): string {
    if (Object.values(input).some((value) => !Number.isFinite(value) || value < 0)) {
      return 'Enter a non-negative number for every field.';
    }
    if (input.propertyPrice === 0) return 'Property price must be greater than zero.';
    if (input.vacancyMonths > 12) return 'Vacancy months must be between 0 and 12.';
    return '';
  }
}
