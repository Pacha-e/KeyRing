// --- Internal imports ---
import { PropertyRepository } from '../../data/PropertyRepository';

// --- Exported members ---
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id');
  if (!id || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    throw createError({ statusCode: 404, statusMessage: 'Property not found' });
  }
  const property = PropertyRepository.findById(Number(id));
  if (!property) {
    throw createError({ statusCode: 404, statusMessage: 'Property not found' });
  }
  return property;
});
