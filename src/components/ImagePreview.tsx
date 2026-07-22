type ImagePreviewProps = {
  previewUrl: string
  fileName: string
}

export function ImagePreview({ previewUrl, fileName }: ImagePreviewProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">2. Vista previa de la imagen</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <img
          src={previewUrl}
          alt={`Vista previa de ${fileName}`}
          className="mx-auto max-h-96 w-full object-contain"
        />
      </div>
    </section>
  )
}
