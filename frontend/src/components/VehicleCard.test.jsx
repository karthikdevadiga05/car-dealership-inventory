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
};

const renderCard = (overrides = {}, props = {}) =>
  render(
    <VehicleCard
      vehicle={{ ...vehicle, ...overrides }}
      isAdmin={false}
      onPurchase={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
      onRestock={() => {}}
      {...props}
    />
  );

describe('VehicleCard', () => {
  it('disables the purchase button when quantity is zero', () => {
    renderCard({ quantity: 0 });

    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('enables the purchase button when the vehicle is in stock', () => {
    renderCard();

    expect(screen.getByRole('button', { name: 'Purchase' })).toBeEnabled();
    expect(screen.getByText('5 in stock')).toBeInTheDocument();
  });

  it('calls onPurchase when the purchase button is clicked', () => {
    const onPurchase = vi.fn();
    renderCard({}, { onPurchase });

    fireEvent.click(screen.getByRole('button', { name: 'Purchase' }));

    expect(onPurchase).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('hides admin controls from normal users', () => {
    renderCard();

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('shows admin controls but no purchase button to admins', () => {
    renderCard({}, { isAdmin: true });

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restock' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Purchase' })).not.toBeInTheDocument();
  });
});