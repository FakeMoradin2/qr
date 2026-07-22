import QRCode from 'qrcode'

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export type QrCustomization = {
  size: number
  margin: number
  foregroundColor: string
  backgroundColor: string
  errorCorrectionLevel: QrErrorCorrectionLevel
  logoDataUrl: string | null
}

export const DEFAULT_QR_CUSTOMIZATION: QrCustomization = {
  size: 320,
  margin: 2,
  foregroundColor: '#0f172a',
  backgroundColor: '#ffffff',
  errorCorrectionLevel: 'M',
  logoDataUrl: null,
}

export const QR_SIZE_OPTIONS = [
  { label: 'Pequeño', value: 256 },
  { label: 'Mediano', value: 320 },
  { label: 'Grande', value: 512 },
  { label: 'Extra', value: 768 },
] as const

export const QR_COLOR_PRESETS = [
  { name: 'Clásico', foreground: '#0f172a', background: '#ffffff' },
  { name: 'Indigo', foreground: '#4f46e5', background: '#ffffff' },
  { name: 'Esmeralda', foreground: '#059669', background: '#ffffff' },
  { name: 'Oscuro', foreground: '#ffffff', background: '#0f172a' },
  { name: 'Rosa', foreground: '#be185d', background: '#fdf2f8' },
  { name: 'Amarillo', foreground: '#0f172a', background: '#fef9c3' },
] as const

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo cargar el logo.'))
    img.src = dataUrl
  })
}

export async function generateQrDataUrl(
  targetUrl: string,
  customization: QrCustomization,
): Promise<string> {
  const errorCorrectionLevel = customization.logoDataUrl
    ? 'H'
    : customization.errorCorrectionLevel

  const canvas = document.createElement('canvas')
  await QRCode.toCanvas(canvas, targetUrl, {
    width: customization.size,
    margin: customization.margin,
    errorCorrectionLevel,
    color: {
      dark: customization.foregroundColor,
      light: customization.backgroundColor,
    },
  })

  if (customization.logoDataUrl) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return canvas.toDataURL('image/png')

    const logo = await loadImage(customization.logoDataUrl)
    const logoSize = canvas.width * 0.2
    const padding = logoSize * 0.12
    const x = (canvas.width - logoSize) / 2
    const y = (canvas.height - logoSize) / 2

    ctx.fillStyle = customization.backgroundColor
    ctx.fillRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2)
    ctx.drawImage(logo, x, y, logoSize, logoSize)
  }

  return canvas.toDataURL('image/png')
}

export function areQrCustomizationsEqual(a: QrCustomization, b: QrCustomization): boolean {
  return (
    a.size === b.size &&
    a.margin === b.margin &&
    a.foregroundColor === b.foregroundColor &&
    a.backgroundColor === b.backgroundColor &&
    a.errorCorrectionLevel === b.errorCorrectionLevel &&
    a.logoDataUrl === b.logoDataUrl
  )
}
