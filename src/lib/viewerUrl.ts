const PDF_PARAM = 'p'
const IMAGE_PARAM = 'i'

function buildMediaViewerUrl(param: string, publicMediaUrl: string): string {
  const base = import.meta.env.VITE_APP_URL || window.location.origin
  const url = new URL(base)
  url.searchParams.set(param, publicMediaUrl)
  return url.toString()
}

export function buildViewerUrl(publicPdfUrl: string): string {
  return buildMediaViewerUrl(PDF_PARAM, publicPdfUrl)
}

export function buildImageViewerUrl(publicImageUrl: string): string {
  return buildMediaViewerUrl(IMAGE_PARAM, publicImageUrl)
}

export function normalizeLinkUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(withProtocol)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

function getViewerMediaUrl(param: string): string | null {
  const value = new URLSearchParams(window.location.search).get(param)
  if (!value) return null

  try {
    const decoded = decodeURIComponent(value)
    if (!decoded.startsWith('https://')) return null
    return decoded
  } catch {
    return null
  }
}

export function getViewerPdfUrl(): string | null {
  return getViewerMediaUrl(PDF_PARAM)
}

export function getViewerImageUrl(): string | null {
  return getViewerMediaUrl(IMAGE_PARAM)
}
