type ImageViewerProps = {
  imageUrl: string
}

export function ImageViewer({ imageUrl }: ImageViewerProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <img
        src={imageUrl}
        alt="Imagen compartida"
        className="max-h-[100dvh] max-w-full object-contain"
      />
    </div>
  )
}
