import { UploadProgress } from './UploadProgress'
import { isSupabaseConfigured } from '../lib/supabase'

type GeneratorMode = 'link' | 'image' | 'pdf'

type ContentInputSectionProps = {
  mode: GeneratorMode
  onModeChange: (mode: GeneratorMode) => void
  linkInput: string
  onLinkChange: (value: string) => void
  onPdfChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onReset: () => void
  pdfInputRef: React.RefObject<HTMLInputElement | null>
  imageInputRef: React.RefObject<HTMLInputElement | null>
  pdfFile: File | null
  imageFile: File | null
  previewUrl: string | null
  fileSizeMb: string | null
  showSizeWarning: boolean
  displayError: string | null
  uploadProgress: number
  uploadStatus: 'idle' | 'uploading' | 'ready' | 'error'
  isUploadReady: boolean
  onRetryUpload?: () => void
}

const MODE_OPTIONS: {
  id: GeneratorMode
  label: string
  description: string
  icon: string
}[] = [
  {
    id: 'link',
    label: 'Enlace',
    description: 'Página web, redes, formulario…',
    icon: '🔗',
  },
  {
    id: 'image',
    label: 'Imagen',
    description: 'Flyer, foto, cartel…',
    icon: '🖼️',
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Documento con visor móvil',
    icon: '📄',
  },
]

export function ContentInputSection({
  mode,
  onModeChange,
  linkInput,
  onLinkChange,
  onPdfChange,
  onImageChange,
  onReset,
  pdfInputRef,
  imageInputRef,
  pdfFile,
  imageFile,
  previewUrl,
  fileSizeMb,
  showSizeWarning,
  displayError,
  uploadProgress,
  uploadStatus,
  isUploadReady,
  onRetryUpload,
}: ContentInputSectionProps) {
  const selectedFile = mode === 'pdf' ? pdfFile : mode === 'image' ? imageFile : null
  const hasContent =
    mode === 'link' ? linkInput.trim().length > 0 : Boolean(selectedFile)

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-indigo-200 bg-white shadow-sm ring-4 ring-indigo-50">
      <div className="border-b border-indigo-100 bg-indigo-50/80 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Paso 1 · Empieza aquí
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">¿Qué quieres compartir?</h2>
        <p className="mt-1 text-sm text-slate-600">
          Elige un tipo y añade tu contenido. Tu QR aparecerá al lado en cuanto esté listo.
        </p>
      </div>

      <div className="p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onModeChange(option.id)}
              className={`rounded-xl border-2 p-4 text-left transition ${
                mode === option.id
                  ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-2xl">{option.icon}</span>
              <p className="mt-2 font-semibold text-slate-900">{option.label}</p>
              <p className="mt-1 text-xs text-slate-500">{option.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          {mode === 'link' && (
            <>
              <label htmlFor="link-input" className="text-sm font-medium text-slate-800">
                Pega tu enlace
              </label>
              <input
                id="link-input"
                type="url"
                value={linkInput}
                onChange={(event) => onLinkChange(event.target.value)}
                placeholder="https://tu-sitio.com/pagina"
                autoFocus
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </>
          )}

          {mode === 'image' && (
            <>
              <p className="text-sm font-medium text-slate-800">Sube tu imagen</p>
              <p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP o GIF</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input
                  ref={imageInputRef}
                  id="image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={onImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image-input"
                  className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  Elegir imagen
                </label>
              </div>
            </>
          )}

          {mode === 'pdf' && (
            <>
              <p className="text-sm font-medium text-slate-800">Sube tu PDF</p>
              <p className="mt-1 text-xs text-slate-500">Se abrirá en un visor optimizado para móvil</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <input
                  ref={pdfInputRef}
                  id="pdf-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={onPdfChange}
                  className="hidden"
                />
                <label
                  htmlFor="pdf-input"
                  className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  Elegir PDF
                </label>
              </div>
            </>
          )}

          {selectedFile && (
            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-3">
              {previewUrl && mode === 'image' && (
                <img
                  src={previewUrl}
                  alt=""
                  className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{fileSizeMb} MB</p>
              </div>
              <button
                type="button"
                onClick={onReset}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cambiar
              </button>
            </div>
          )}

          {showSizeWarning && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              PDF grande: comprime el archivo si supera 2 MB para mejor experiencia en móvil.
            </p>
          )}

          {selectedFile && isSupabaseConfigured && (mode === 'pdf' || mode === 'image') && (
            <div className="mt-4">
              <UploadProgress
                progress={uploadProgress}
                status={
                  uploadStatus === 'error' ? 'error' : isUploadReady ? 'ready' : 'uploading'
                }
              />
            </div>
          )}

          {uploadStatus === 'error' && displayError && onRetryUpload && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{displayError}</p>
              <button
                type="button"
                onClick={onRetryUpload}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                Reintentar
              </button>
            </div>
          )}

          {displayError && uploadStatus !== 'error' && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{displayError}</p>
          )}

          {mode === 'link' && hasContent && (
            <button
              type="button"
              onClick={onReset}
              className="mt-3 text-sm font-medium text-slate-500 transition hover:text-slate-700"
            >
              Limpiar enlace
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
