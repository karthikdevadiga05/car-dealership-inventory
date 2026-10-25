import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import VehicleImage from './VehicleImage';

describe('VehicleImage', () => {
  it('shows the photo when a source is given', () => {
    render(<VehicleImage src="https://example.com/camry.jpg" alt="Toyota Camry" />);

    expect(screen.getByRole('img', { name: 'Toyota Camry' })).toHaveAttribute(
      'src',
      'https://example.com/camry.jpg'
    );
  });

  it('falls back to the default illustration when the photo fails to load', () => {
    render(<VehicleImage src="https://example.com/broken.jpg" alt="Toyota Camry" />);

    fireEvent.error(screen.getByRole('img', { name: 'Toyota Camry' }));

    expect(
      screen.getByRole('img', { name: 'Toyota Camry (no photo available)' })
    ).toBeInTheDocument();
  });

  it('shows the default illustration when there is no photo', () => {
    render(<VehicleImage src={null} alt="Toyota Camry" />);

    expect(
      screen.getByRole('img', { name: 'Toyota Camry (no photo available)' })
    ).toBeInTheDocument();
  });
});