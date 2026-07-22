import { useEffect, useRef, useState } from 'react'
import { generateQrDataUrl, type QrCustomization } from '../lib/qrOptions'

const PREVIEW_DEBOUNCE_MS = 250
export const QR_PREVIEW_PLACEHOLDER_URL = 'https://ejemplo.com'

export function useLiveQrPreview(
  targetUrl: string | null,
  customization: QrCustomization,
) {
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const generationIdRef = useRef(0)

  const isPlaceholder = !targetUrl
  const effectiveUrl = targetUrl ?? QR_PREVIEW_PLACEHOLDER_URL

  useEffect(() => {
    const generationId = ++generationIdRef.current
    setIsGenerating(true)
    setError(null)

    const timer = window.setTimeout(() => {
      generateQrDataUrl(effectiveUrl, customization)
        .then((dataUrl) => {
          if (generationId !== generationIdRef.current) return
          setPreviewDataUrl(dataUrl)
          setIsGenerating(false)
        })
        .catch(() => {
          if (generationId !== generationIdRef.current) return
          setPreviewDataUrl(null)
          setError('No se pudo generar la vista previa.')
          setIsGenerating(false)
        })
    }, PREVIEW_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [effectiveUrl, customization])

  return {
    previewDataUrl,
    isGenerating,
    error,
    isPlaceholder,
    effectiveUrl,
  }
}
