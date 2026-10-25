import { afterEach, describe, expect, it, vi } from 'vitest';
import { cropImage } from './cropImage';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('cropImage', () => {
  it('returns the original file when the browser cannot crop it', async () => {
    const file = new File(['x'], 'car.png', { type: 'image/png' });

    expect(await cropImage(file, { x: 0, y: 0, width: 10, height: 10 })).toBe(file);
  });

  it('cuts out the chosen area, shrinks it to 1280px wide and saves a JPEG', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({ width: 4000, height: 3000, close: vi.fn() })
    );
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillRect: vi.fn(),
      drawImage,
    });
    let canvasSize;
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (callback) {
      canvasSize = [this.width, this.height];
      callback(new Blob(['small'], { type: 'image/jpeg' }));
    });
    const file = new File(['x'], 'phone.png', { type: 'image/png' });

    const result = await cropImage(file, { x: 100, y: 200, width: 2560, height: 1440 });

    expect(canvasSize).toEqual([1280, 720]);
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 100, 200, 2560, 1440, 0, 0, 1280, 720);
    expect(result.type).toBe('image/jpeg');
    expect(result.name).toBe('phone.jpg');
  });
});