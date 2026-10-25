import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import VehicleForm from './VehicleForm';

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
});

const renderForm = (onSubmit = vi.fn().mockResolvedValue()) => {
  render(<VehicleForm vehicle={{}} onSubmit={onSubmit} onClose={() => {}} />);
  return onSubmit;
};

const pick = (file) =>
  fireEvent.change(screen.getByLabelText('Photo (optional)'), {
    target: { files: [file] },
  });

describe('VehicleForm photo', () => {
  it('rejects a file that is not an image', async () => {
    renderForm();

    pick(new File(['hello'], 'notes.txt', { type: 'text/plain' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('JPEG, PNG or WebP');
  });

  it('rejects a photo that is still larger than 2 MB after resizing', async () => {
    renderForm();

    pick(new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('2 MB');
  });

  it('rejects a photo larger than 20 MB without trying to resize it', async () => {
    renderForm();

    pick(new File([new Uint8Array(20 * 1024 * 1024 + 1)], 'huge.png', { type: 'image/png' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('20 MB');
  });

  it('submits the vehicle together with the chosen photo', async () => {
    const onSubmit = renderForm();
    const photo = new File(['png-bytes'], 'camry.png', { type: 'image/png' });

    fireEvent.change(screen.getByLabelText('Make'), { target: { value: 'Toyota' } });
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Camry' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Sedan' } });
    fireEvent.change(screen.getByLabelText('Price (₹)'), { target: { value: '25000' } });
    fireEvent.change(screen.getByLabelText('Stock quantity'), { target: { value: '5' } });
    pick(photo);
    await screen.findByRole('img', { name: 'Photo preview' });
    fireEvent.click(screen.getByRole('button', { name: 'Add vehicle' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ make: 'Toyota', price: 25000, quantity: 5 }),
        { file: photo, remove: false }
      )
    );
  });

  it('submits without a photo when the admin adds none', async () => {
    const onSubmit = renderForm();

    fireEvent.change(screen.getByLabelText('Make'), { target: { value: 'Honda' } });
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Civic' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Sedan' } });
    fireEvent.change(screen.getByLabelText('Price (₹)'), { target: { value: '22000' } });
    fireEvent.change(screen.getByLabelText('Stock quantity'), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add vehicle' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ make: 'Honda' }), {
        file: null,
        remove: false,
      })
    );
  });
});