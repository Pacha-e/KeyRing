// --- Internal imports ---
import type { PropertyInterface } from '../interfaces/PropertyInterface';

// --- Types ---
export type CreatePropertyDto = Omit<PropertyInterface, 'id'>;
