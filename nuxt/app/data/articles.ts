// --- Internal imports ---
import type { Article } from '../interfaces/Article';

// --- Constants ---
export const articles: Article[] = [
  {
    author: 'KeyRing Editorial Team',
    body: [
      'Rental yield measures annual rent against a property value. It helps landlords compare properties with different purchase prices, although it does not predict every future expense.',
      'To calculate gross yield, multiply monthly rent by twelve, divide by the purchase price or current market value, and multiply by 100. For example, monthly rent of $1,000 on a $200,000 property gives a gross yield of 6%.',
      'Net yield accounts for operating costs. Subtract annual expenses such as insurance, maintenance, administration fees and property taxes from annual rent before dividing by the property value. State clearly whether financing costs are included when comparing results.',
      'Allow for vacancies and unpaid rent instead of assuming twelve paid months. Review the calculation whenever rent, property value or recurring costs change, and compare properties using the same assumptions.',
    ],
    publishedAt: '2026-09-01',
    readingMinutes: 3,
    slug: 'how-to-calculate-rental-yield',
    summary: 'Compare rental income with property value and understand the costs behind net yield.',
    title: 'How to Calculate Rental Yield',
  },
  {
    author: 'KeyRing Editorial Team',
    body: [
      'A reliable rental budget starts with the expenses that continue even when a property is vacant. Record each recurring bill alongside its amount, due date and payment frequency.',
      'Property taxes, insurance premiums and building administration fees are common fixed costs. If a bill is annual or quarterly, divide it into monthly equivalents so it can be compared with monthly rent.',
      'Some utilities, subscriptions and contracted services may remain the responsibility of the landlord. Check each lease and service agreement to distinguish the costs of the owner from charges paid directly by tenants.',
      'Fixed costs are only part of the budget. Keep a separate reserve for repairs, replacements and vacancy, then review actual spending against estimates at least once a year.',
    ],
    publishedAt: '2026-09-08',
    readingMinutes: 3,
    slug: 'fixed-costs-every-landlord-should-track',
    summary:
      'Build a clearer property budget by recording recurring obligations and payment dates.',
    title: 'Fixed Costs Every Landlord Should Track',
  },
  {
    author: 'KeyRing Editorial Team',
    body: [
      'Short-term rentals can offer flexible pricing and personal access to a property, while long-term leases usually provide more predictable occupancy and fewer tenant changes.',
      'Compare income after realistic occupancy assumptions. A higher nightly rate does not guarantee higher annual revenue if the property sits empty between bookings or demand changes by season.',
      'Short stays often add cleaning, furnishing, platform fees and guest communication. Long-term rentals also need maintenance and vacancy reserves, but their turnover and operating routines may differ.',
      'Before choosing a model, check local rules, building policies, insurance coverage and tax obligations. Revisit the decision as costs, demand and your available management time change.',
    ],
    publishedAt: '2026-09-15',
    readingMinutes: 3,
    slug: 'short-term-vs-long-term-rentals',
    summary:
      'Compare income, occupancy and operating responsibilities before choosing a rental strategy.',
    title: 'Short-Term vs Long-Term Rentals',
  },
];
