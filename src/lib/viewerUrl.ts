const PDF_PARAM = 'p'

export function buildViewerUrl(publicPdfUrl: string): string {
  const base = import.meta.env.VITE_APP_URL || window.location.origin
  const url = new URL(base)
  url.searchParams.set(PDF_PARAM, publicPdfUrl)
  return url.toString()
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
