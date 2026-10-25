import { AppError } from '../errors/AppError';
import * as repo from '../repositories/vehicle.repository';
import { parseId } from './vehicle.service';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Identifies JPEG, PNG or WebP from the file's first bytes (not its name or declared type). */
export function detectImageType(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return 'image/png';
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

export async function setVehicleImage(
  rawId: unknown,
  buffer?: Buffer
): Promise<repo.Vehicle> {
  const id = parseId(rawId);
  if (!buffer) {
    throw new AppError(400, 'An image file is required (form field "image")');
  }
  const type = detectImageType(buffer);
  if (!type) {
    throw new AppError(400, 'Image must be a JPEG, PNG or WebP file');
  }
  const vehicle = await repo.saveImage(id, buffer, type);
  if (!vehicle) throw new AppError(404, 'Vehicle not found');
  return vehicle;
}

export async function removeVehicleImage(rawId: unknown): Promise<repo.Vehicle> {
  const vehicle = await repo.clearImage(parseId(rawId));
  if (!vehicle) throw new AppError(404, 'Vehicle not found');
  return vehicle;
}

export async function getVehicleImage(rawId: unknown): Promise<repo.StoredImage> {
  const image = await repo.findImage(parseId(rawId));
  if (!image) throw new AppError(404, 'Image not found');
  return image;
}