import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import VehicleForm from './VehicleForm';

// The real cropper needs browser layout; this stand-in just reports a crop area when clicked.
vi.mock('react-easy-crop', async () => {
  const { createElement } = await import('react');
  return {
    default: ({ onCropComplete }) =>
      createElement(
        'button',
        {
          type: 'button',
          onClick: () => onCropComplete({}, { x: 0, y: 0, width: 100, height: 56 }),
        },
        'Move crop'
      ),
  };
});

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

const fill = (make, model, category, price, quantity) => {
  fireEvent.change(screen.getByLabelText('Make'), { target: { value: make } });
  fireEvent.change(screen.getByLabelText('Model'), { target: { value: model } });
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: category } });
  fireEvent.change(screen.getByLabelText('Price (₹)'), { target: { value: price } });
  fireEvent.change(screen.getByLabelText('Stock quantity'), { target: { value: quantity } });
};

describe('VehicleForm photo', () => {
  it('rejects a file that is not an image', async () => {
    renderForm();

    pick(new File(['hello'], 'notes.txt', { type: 'text/plain' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('JPEG, PNG or WebP');
  });

  it('rejects a photo larger than 20 MB without opening the cropper', async () => {
    renderForm();

    pick(new File([new Uint8Array(20 * 1024 * 1024 + 1)], 'huge.png', { type: 'image/png' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('20 MB');
    expect(screen.queryByRole('button', { name: 'Apply crop' })).not.toBeInTheDocument();
  });

  it('opens the crop step when a photo is picked', async () => {
    renderForm();

    pick(new File(['png-bytes'], 'camry.png', { type: 'image/png' }));

    expect(await screen.findByRole('button', { name: 'Apply crop' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use whole photo' })).toBeInTheDocument();
  });

  it('rejects a photo that is still larger than 2 MB after resizing', async () => {
    renderForm();

    pick(new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Use whole photo' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('2 MB');
  });

  it('submits the vehicle with the whole photo', async () => {
    const onSubmit = renderForm();
    const photo = new File(['png-bytes'], 'camry.png', { type: 'image/png' });

    fill('Toyota', 'Camry', 'Sedan', '25000', '5');
    pick(photo);
    fireEvent.click(await screen.findByRole('button', { name: 'Use whole photo' }));
    await screen.findByRole('img', { name: 'Photo preview' });
    fireEvent.click(screen.getByRole('button', { name: 'Add vehicle' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ make: 'Toyota', price: 25000, quantity: 5 }),
        { file: photo, remove: false }
      )
    );
  });

  it('submits the vehicle with the cropped photo', async () => {
    const onSubmit = renderForm();
    const photo = new File(['png-bytes'], 'camry.png', { type: 'image/png' });

    fill('Toyota', 'Camry', 'Sedan', '25000', '5');
    pick(photo);
    fireEvent.click(await screen.findByRole('button', { name: 'Move crop' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply crop' }));
    await screen.findByRole('img', { name: 'Photo preview' });
    fireEvent.click(screen.getByRole('button', { name: 'Add vehicle' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ make: 'Toyota' }), {
        file: photo,
        remove: false,
      })
    );
  });

  it('cancelling the crop adds no photo', async () => {
    renderForm();

    pick(new File(['png-bytes'], 'camry.png', { type: 'image/png' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel crop' }));

    expect(screen.queryByRole('button', { name: 'Apply crop' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Photo preview (no photo available)' })
    ).toBeInTheDocument();
  });

  it('submits without a photo when the admin adds none', async () => {
    const onSubmit = renderForm();

    fill('Honda', 'Civic', 'Sedan', '22000', '8');
    fireEvent.click(screen.getByRole('button', { name: 'Add vehicle' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ make: 'Honda' }), {
        file: null,
        remove: false,
      })
    );
  });
});