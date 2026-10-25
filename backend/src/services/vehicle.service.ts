import { AppError } from '../errors/AppError';
import * as repo from '../repositories/vehicle.repository';

const TEXT_FIELDS = ['make', 'model', 'category'] as const;

export function parseId(raw: unknown): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'Invalid vehicle id');
  }
  return id;
}

/** Validates vehicle fields. When requireAll is false, missing fields are skipped. */
function validate(
  body: Record<string, unknown>,
  requireAll: boolean
): Partial<repo.VehicleInput> {
  const result: Partial<repo.VehicleInput> = {};

  for (const field of TEXT_FIELDS) {
    const value = body[field];
    if (value === undefined && !requireAll) continue;
    if (typeof value !== 'string' || !value.trim()) {
      throw new AppError(400, `${field} is required`);
    }
    result[field] = value.trim();
  }

  if (body.price !== undefined || requireAll) {
    const { price } = body;
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
      throw new AppError(400, 'price must be a non-negative number');
    }
    result.price = price;
  }

  if (body.quantity !== undefined || requireAll) {
    const { quantity } = body;
    if (!Number.isInteger(quantity) || (quantity as number) < 0) {
      throw new AppError(400, 'quantity must be a non-negative integer');
    }
    result.quantity = quantity as number;
  }

  return result;
}

function parsePrice(value: unknown, name: string): number | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new AppError(400, `${name} must be a non-negative number`);
  }
  return parsed;
}

export async function addVehicle(
  body: Record<string, unknown>
): Promise<repo.Vehicle> {
  return repo.insert(validate(body, true) as repo.VehicleInput);
}

export async function listVehicles(): Promise<repo.Vehicle[]> {
  return repo.findAll();
}

export async function searchVehicles(
  query: Record<string, unknown>
): Promise<repo.Vehicle[]> {
  const filters: repo.SearchFilters = {};
  for (const field of TEXT_FIELDS) {
    const value = query[field];
    if (typeof value === 'string' && value.trim()) {
      filters[field] = value.trim();
    }
  }
  filters.minPrice = parsePrice(query.minPrice, 'minPrice');
  filters.maxPrice = parsePrice(query.maxPrice, 'maxPrice');
  return repo.search(filters);
}

export async function updateVehicle(
  rawId: unknown,
  body: Record<string, unknown>
): Promise<repo.Vehicle> {
  const id = parseId(rawId);
  const fields = validate(body, false);
  if (Object.keys(fields).length === 0) {
    throw new AppError(400, 'No fields to update');
  }
  const vehicle = await repo.update(id, fields);
  if (!vehicle) throw new AppError(404, 'Vehicle not found');
  return vehicle;
}

export async function deleteVehicle(rawId: unknown): Promise<void> {
  const deleted = await repo.remove(parseId(rawId));
  if (!deleted) throw new AppError(404, 'Vehicle not found');
}


export async function purchaseVehicle(
  rawId: unknown,
  rawQuantity?: unknown
): Promise<repo.Vehicle> {
  const id = parseId(rawId);
  const amount = rawQuantity ?? 1;
  if (!Number.isInteger(amount) || (amount as number) <= 0) {
    throw new AppError(400, 'quantity must be a positive integer');
  }

  const vehicle = await repo.decrementStock(id, amount as number);
  if (vehicle) return vehicle;

  // No row updated: the vehicle is missing, sold out, or has less stock than requested.
  const existing = await repo.findById(id);
  if (!existing) throw new AppError(404, 'Vehicle not found');
  if (existing.quantity === 0) throw new AppError(400, 'Vehicle is out of stock');
  throw new AppError(400, 'Not enough stock');
}

export async function restockVehicle(
  rawId: unknown,
  amount: unknown
): Promise<repo.Vehicle> {
  const id = parseId(rawId);
  if (!Number.isInteger(amount) || (amount as number) <= 0) {
    throw new AppError(400, 'quantity must be a positive integer');
  }
  const vehicle = await repo.incrementStock(id, amount as number);
  if (!vehicle) throw new AppError(404, 'Vehicle not found');
  return vehicle;
}