import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import VehicleCard from './VehicleCard';

const vehicle = {
  id: 1,
  make: 'Toyota',
  model: 'Camry',
  category: 'Sedan',
  price: 25000,
  quantity: 5,
  imagePath: null,
};

const renderCard = (overrides) =>
  render(
    <VehicleCard
      vehicle={{ ...vehicle, ...overrides }}
      isAdmin={false}
      onPurchase={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
      onRestock={() => {}}
    />
  );

describe('VehicleCard photo', () => {
  it('shows the uploaded photo that users receive from the API', () => {
    renderCard({ imagePath: '/vehicles/1/image?v=5' });

    expect(screen.getByRole('img', { name: 'Toyota Camry' })).toHaveAttribute(
      'src',
      expect.stringContaining('/vehicles/1/image?v=5')
    );
  });

  it('shows the default illustration when the admin added no photo', () => {
    renderCard({ imagePath: null });

    expect(
      screen.getByRole('img', { name: 'Toyota Camry (no photo available)' })
    ).toBeInTheDocument();
  });
});