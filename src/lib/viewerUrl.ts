const PDF_PARAM = 'p'

export function buildViewerUrl(publicPdfUrl: string): string {
  const base = import.meta.env.VITE_APP_URL || window.location.origin
  const url = new URL(base)
  url.searchParams.set(PDF_PARAM, publicPdfUrl)
  return url.toString()
}

export function getViewerPdfUrl(): string | null {
  const value = new URLSearchParams(window.location.search).get(PDF_PARAM)
  if (!value) return null

  try {
    const decoded = decodeURIComponent(value)
    if (!decoded.startsWith('https://')) return null
    return decoded
  } catch {
    return null
  }
}
