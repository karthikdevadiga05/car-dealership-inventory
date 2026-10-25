import { describe, expect, it } from 'vitest';
import { sortVehicles } from './sortVehicles';

const cars = [
  { id: 1, price: 30000 },
  { id: 2, price: 10000 },
  { id: 3, price: 20000 },
];

const ids = (list) => list.map((v) => v.id);

describe('sortVehicles', () => {
  it('keeps the original order for featured', () => {
    expect(ids(sortVehicles(cars, 'featured'))).toEqual([1, 2, 3]);
  });

  it('sorts from low to high price', () => {
    expect(ids(sortVehicles(cars, 'price-asc'))).toEqual([2, 3, 1]);
  });

  it('sorts from high to low price', () => {
    expect(ids(sortVehicles(cars, 'price-desc'))).toEqual([1, 3, 2]);
  });

  it('does not change the original list', () => {
    sortVehicles(cars, 'price-asc');

    expect(ids(cars)).toEqual([1, 2, 3]);
  });
});