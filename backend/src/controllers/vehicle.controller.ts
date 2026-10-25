import { asyncHandler as handle } from '../middleware/asyncHandler';
import * as imageService from '../services/image.service';
import * as service from '../services/vehicle.service';

export const create = handle(async (req, res) => {
  res.status(201).json(await service.addVehicle(req.body ?? {}));
});

export const list = handle(async (_req, res) => {
  res.json(await service.listVehicles());
});

export const search = handle(async (req, res) => {
  res.json(await service.searchVehicles(req.query as Record<string, unknown>));
});

export const update = handle(async (req, res) => {
  res.json(await service.updateVehicle(req.params.id, req.body ?? {}));
});

export const remove = handle(async (req, res) => {
  await service.deleteVehicle(req.params.id);
  res.status(204).send();
});

export const purchase = handle(async (req, res) => {
  res.json(await service.purchaseVehicle(req.params.id, req.body?.quantity));
});

export const restock = handle(async (req, res) => {
  res.json(await service.restockVehicle(req.params.id, req.body?.quantity));
});

export const uploadImage = handle(async (req, res) => {
  res.json(await imageService.setVehicleImage(req.params.id, req.file?.buffer));
});

export const deleteImage = handle(async (req, res) => {
  res.json(await imageService.removeVehicleImage(req.params.id));
});

/** Serves the raw photo. The ?v= in the URL changes on every upload, so it can be cached forever. */
export const image = handle(async (req, res) => {
  const { data, type } = await imageService.getVehicleImage(req.params.id);
  res.set('Content-Type', type);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(data);
});