import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import VehicleDetails from './VehicleDetails';

const vehicle = {
  id: 1,
  make: 'Toyota',
  model: 'Camry',
  category: 'Sedan',
  price: 25000,
  quantity: 5,
  imagePath: null,
};

describe('VehicleDetails', () => {
  it('shows the vehicle details', () => {
    render(<VehicleDetails vehicle={vehicle} onPurchase={() => {}} onClose={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Camry' })).toBeInTheDocument();
    expect(screen.getByText('Sedan')).toBeInTheDocument();
    expect(screen.getByText('5 in stock')).toBeInTheDocument();
  });

  it('starts a purchase from the details popup', () => {
    const onPurchase = vi.fn();
    render(<VehicleDetails vehicle={vehicle} onPurchase={onPurchase} onClose={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Purchase' }));

    expect(onPurchase).toHaveBeenCalledWith(vehicle);
  });

  it('disables purchase when the vehicle is out of stock', () => {
    render(
      <VehicleDetails vehicle={{ ...vehicle, quantity: 0 }} onPurchase={() => {}} onClose={() => {}} />
    );

    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
  });
});