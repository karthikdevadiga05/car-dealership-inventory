import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import QuantityModal from './QuantityModal';

const renderModal = (props = {}) =>
  render(
    <QuantityModal
      title="Confirm purchase"
      subtitle="Toyota Camry"
      max={5}
      confirmLabel="Confirm purchase"
      onConfirm={() => Promise.resolve()}
      onClose={() => {}}
      {...props}
    />
  );

describe('QuantityModal', () => {
  it('submits the chosen quantity as a number', async () => {
    const onConfirm = vi.fn().mockResolvedValue();
    renderModal({ onConfirm });

    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm purchase' }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith(3));
  });

  it('limits the quantity to the available stock', () => {
    renderModal();

    expect(screen.getByLabelText('Quantity')).toHaveAttribute('max', '5');
  });

  it('shows the error returned when confirming fails', async () => {
    renderModal({ onConfirm: vi.fn().mockRejectedValue(new Error('Not enough stock')) });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm purchase' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Not enough stock');
  });
});