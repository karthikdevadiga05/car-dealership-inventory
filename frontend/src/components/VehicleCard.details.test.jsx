import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

const renderCard = (isAdmin, onDetails = () => {}) =>
  render(
    <VehicleCard
      vehicle={vehicle}
      isAdmin={isAdmin}
      onPurchase={() => {}}
      onDetails={onDetails}
      onEdit={() => {}}
      onDelete={() => {}}
      onRestock={() => {}}
    />
  );

describe('VehicleCard details', () => {
  it('opens the details when View details is clicked', () => {
    const onDetails = vi.fn();
    renderCard(false, onDetails);

    fireEvent.click(screen.getByRole('button', { name: 'View details' }));

    expect(onDetails).toHaveBeenCalledWith(vehicle);
  });

  it('does not show View details to admins', () => {
    renderCard(true);

    expect(screen.queryByRole('button', { name: 'View details' })).not.toBeInTheDocument();
  });
});