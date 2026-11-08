/**
 * Prépare la photo d'un joueur pour le stockage local :
 * recadrage au centre au format portrait 4:5, redimensionnement en 480×600
 * et compression JPEG. Le résultat (data URL, ~40 à 80 Ko) reste léger
 * pour tenir dans le stockage du navigateur ou de l'application Windows.
 */
const TARGET_W = 480;
const TARGET_H = 600;
const QUALITY = 0.82;

export async function preparePlayerPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error("Ce fichier n'est pas une image.");
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const ratio = TARGET_W / TARGET_H;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    if (sw / sh > ratio) sw = sh * ratio;
    else sh = sw / ratio;
    const sx = (img.naturalWidth - sw) / 2;
    // Décalage léger vers le haut : les visages sont rarement au centre exact.
    const sy = Math.max(0, (img.naturalHeight - sh) * 0.35);

    const canvas = document.createElement('canvas');
    canvas.width = TARGET_W;
    canvas.height = TARGET_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Impossible de traiter l'image.");
    ctx.fillStyle = '#12274A';
    ctx.fillRect(0, 0, TARGET_W, TARGET_H);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_W, TARGET_H);
    return canvas.toDataURL('image/jpeg', QUALITY);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Impossible de lire cette image."));
    img.src = src;
  });
}
