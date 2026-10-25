const MAX_WIDTH = 1280;
const QUALITY = 0.85;

/**
 * Cuts the chosen area out of a photo and saves it as a JPEG (max 1280px wide).
 * `area` is in the photo's own pixels: { x, y, width, height }.
 * Returns the original file if the browser cannot do it.
 */
export async function cropImage(file, area) {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_WIDTH / area.width);
    const width = Math.round(area.width * scale);
    const height = Math.round(area.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; // JPEG has no transparency
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, area.x, area.y, area.width, area.height, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.\w+$/, '')}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}