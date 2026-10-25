import { NextFunction, Request, Response } from 'express';
import * as service from '../services/vehicle.service';

type Handler = (req: Request, res: Response) => Promise<void>;

/** Wraps an async handler so any thrown error reaches the error middleware. */
const handle =
  (fn: Handler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res).catch(next);
  };

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