const IMAGE_POLICIES = Object.freeze({
  banners: {
    label: 'Banner rasmi',
    maxUploadBytes: 2.5 * 1024 * 1024,
    maxStoredBytes: 900 * 1024,
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    mimeType: 'image/webp'
  },
  news: {
    label: 'Yangilik rasmi',
    maxUploadBytes: 2 * 1024 * 1024,
    maxStoredBytes: 700 * 1024,
    maxWidth: 1280,
    maxHeight: 720,
    quality: 0.8,
    mimeType: 'image/webp'
  },
  announcements: {
    label: 'E’lon rasmi',
    maxUploadBytes: 2 * 1024 * 1024,
    maxStoredBytes: 700 * 1024,
    maxWidth: 1280,
    maxHeight: 720,
    quality: 0.8,
    mimeType: 'image/webp'
  }
});

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function formatBytes(bytes = 0) {
  const size = Number(bytes || 0);

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.round(size / 1024)} KB`;
}

function dataUrlSizeInBytes(dataUrl = '') {
  const base64 = String(dataUrl || '').split(',')[1] || '';
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl =
      source instanceof File || source instanceof Blob ? URL.createObjectURL(source) : null;

    image.onload = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      resolve(image);
    };

    image.onerror = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      reject(new Error('Rasmni o‘qib bo‘lmadi.'));
    };

    image.src = objectUrl || String(source || '');
  });
}

function drawScaledImage(image, policy) {
  const widthRatio = policy.maxWidth / image.width;
  const heightRatio = policy.maxHeight / image.height;
  const ratio = Math.min(widthRatio, heightRatio, 1);
  const targetWidth = Math.max(1, Math.round(image.width * ratio));
  const targetHeight = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement('canvas');

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Rasmni qayta ishlashning imkoni bo‘lmadi.');
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  return { canvas, targetWidth, targetHeight };
}

function canvasToDataUrl(canvas, mimeType, quality) {
  return canvas.toDataURL(mimeType, quality);
}

export function getManagedImagePolicy(resource) {
  return IMAGE_POLICIES[resource] || null;
}

export function getManagedImageHelperText(resource) {
  const policy = getManagedImagePolicy(resource);

  if (!policy) {
    return '';
  }

  return `${policy.label}: JPG, PNG yoki WEBP. Yuklash limiti ${formatBytes(
    policy.maxUploadBytes
  )}, saqlanadigan rasm ${formatBytes(policy.maxStoredBytes)} dan oshmasin.`;
}

export async function prepareManagedImageUpload(file, resource) {
  const policy = getManagedImagePolicy(resource);

  if (!policy) {
    throw new Error('Rasm siyosati topilmadi.');
  }

  if (!file) {
    throw new Error('Rasm tanlanmagan.');
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Faqat JPG, PNG yoki WEBP formatdagi rasmlar ruxsat etiladi.');
  }

  if (file.size > policy.maxUploadBytes) {
    throw new Error(
      `${policy.label} ${formatBytes(policy.maxUploadBytes)} dan katta bo‘lmasligi kerak.`
    );
  }

  const image = await loadImage(file);
  const { canvas } = drawScaledImage(image, policy);
  let quality = policy.quality;
  let dataUrl = canvasToDataUrl(canvas, policy.mimeType, quality);
  let storedBytes = dataUrlSizeInBytes(dataUrl);

  while (storedBytes > policy.maxStoredBytes && quality > 0.45) {
    quality = Number((quality - 0.08).toFixed(2));
    dataUrl = canvasToDataUrl(canvas, policy.mimeType, quality);
    storedBytes = dataUrlSizeInBytes(dataUrl);
  }

  if (storedBytes > policy.maxStoredBytes) {
    throw new Error(
      `${policy.label} siqilgandan keyin ham ${formatBytes(
        policy.maxStoredBytes
      )} dan katta bo‘lib qoldi. Kichikroq rasm yuklang.`
    );
  }

  return {
    dataUrl,
    storedBytes
  };
}

export async function prepareManagedImageDataUrl(dataUrl, resource) {
  const policy = getManagedImagePolicy(resource);
  const normalizedDataUrl = String(dataUrl || '').trim();

  if (!policy || !normalizedDataUrl.startsWith('data:image/')) {
    return normalizedDataUrl;
  }

  const storedBytes = dataUrlSizeInBytes(normalizedDataUrl);

  if (storedBytes <= policy.maxStoredBytes) {
    return normalizedDataUrl;
  }

  const image = await loadImage(normalizedDataUrl);
  const { canvas } = drawScaledImage(image, policy);
  let quality = policy.quality;
  let optimizedDataUrl = canvasToDataUrl(canvas, policy.mimeType, quality);
  let optimizedBytes = dataUrlSizeInBytes(optimizedDataUrl);

  while (optimizedBytes > policy.maxStoredBytes && quality > 0.45) {
    quality = Number((quality - 0.08).toFixed(2));
    optimizedDataUrl = canvasToDataUrl(canvas, policy.mimeType, quality);
    optimizedBytes = dataUrlSizeInBytes(optimizedDataUrl);
  }

  if (optimizedBytes > policy.maxStoredBytes) {
    throw new Error(
      `${policy.label} siqilgandan keyin ham ${formatBytes(
        policy.maxStoredBytes
      )} dan katta bo‘lib qoldi. Kichikroq rasm yuklang.`
    );
  }

  return optimizedDataUrl;
}
