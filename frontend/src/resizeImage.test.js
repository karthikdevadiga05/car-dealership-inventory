import { afterEach, describe, expect, it, vi } from 'vitest';
import { resizeImage } from './resizeImage';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('resizeImage', () => {
  it('returns the original file when the browser cannot resize it', async () => {
    const file = new File(['x'], 'car.png', { type: 'image/png' });

    expect(await resizeImage(file)).toBe(file);
  });

  it('shrinks a big photo to 1280px on its longest side and saves it as a JPEG', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({ width: 4000, height: 2000, close: vi.fn() })
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    });
    let canvasSize;
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (callback) {
      canvasSize = [this.width, this.height];
      callback(new Blob(['small'], { type: 'image/jpeg' }));
    });
    const big = new File([new Uint8Array(3 * 1024 * 1024)], 'phone.png', { type: 'image/png' });

    const result = await resizeImage(big);

    expect(canvasSize).toEqual([1280, 640]);
    expect(result.type).toBe('image/jpeg');
    expect(result.name).toBe('phone.jpg');
    expect(result.size).toBeLessThan(big.size);
  });
});