import { useCallback, useEffect, useRef, useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'
import { uploadPdf } from '../lib/uploadPdf'

export type UploadStatus = 'idle' | 'uploading' | 'ready' | 'error'

export function usePdfUpload(pdfFile: File | null) {
  const [publicUrl, setPublicUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const uploadIdRef = useRef(0)

  const startUpload = useCallback((file: File) => {
    if (!isSupabaseConfigured) return

    const uploadId = ++uploadIdRef.current
    const controller = new AbortController()

    setStatus('uploading')
    setProgress(0)
    setPublicUrl(null)
    setError(null)

    uploadPdf(file, {
      signal: controller.signal,
      onProgress: (value) => {
        if (uploadId === uploadIdRef.current) {
          setProgress(value)
        }
      },
    })
      .then((url) => {
        if (uploadId === uploadIdRef.current) {
          setPublicUrl(url)
          setStatus('ready')
          setProgress(100)
        }
      })
      .catch((err) => {
        if (uploadId !== uploadIdRef.current) return
        if (err instanceof DOMException && err.name === 'AbortError') return

        setError(err instanceof Error ? err.message : 'No se pudo subir el PDF.')
        setStatus('error')
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!pdfFile) {
      uploadIdRef.current += 1
      setPublicUrl(null)
      setStatus('idle')
      setProgress(0)
      setError(null)
      return
    }

    if (!isSupabaseConfigured) {
      setStatus('idle')
      return
    }

    return startUpload(pdfFile)
  }, [pdfFile, startUpload])

  const retry = useCallback(() => {
    if (pdfFile) {
      return startUpload(pdfFile)
    }
  }, [pdfFile, startUpload])

  return { publicUrl, status, progress, error, retry }
}
