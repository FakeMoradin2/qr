type UploadProgressProps = {
  progress: number
  status: 'uploading' | 'ready' | 'error'
}

export function UploadProgress({ progress, status }: UploadProgressProps) {
  if (status === 'ready') {
    return (
      <p className="mt-3 text-sm font-medium text-emerald-700">
        PDF publicado correctamente. Listo para generar el QR.
      </p>
    )
  }

  if (status !== 'uploading') return null

  return (
    <div className="mt-4">
      <div className="mb-1 flex justify-between text-xs text-slate-600">
        <span>Subiendo PDF en segundo plano...</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
