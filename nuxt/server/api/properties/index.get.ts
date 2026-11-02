// --- Internal imports ---
import { PropertyRepository } from '../../data/PropertyRepository';

// --- Exported members ---
export default defineEventHandler(() => PropertyRepository.findAll());
