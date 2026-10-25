import { asyncHandler as handle } from '../middleware/asyncHandler';
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
  res.json(await service.purchaseVehicle(req.params.id));
});

export const restock = handle(async (req, res) => {
  res.json(await service.restockVehicle(req.params.id, req.body?.quantity));
});