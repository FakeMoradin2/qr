import { useRef } from 'react'
import {
  DEFAULT_QR_CUSTOMIZATION,
  QR_COLOR_PRESETS,
  QR_SIZE_OPTIONS,
  type QrCustomization,
  type QrErrorCorrectionLevel,
} from '../lib/qrOptions'

type QrCustomizerProps = {
  value: QrCustomization
  onChange: (value: QrCustomization) => void
  embedded?: boolean
}

const ERROR_LEVELS: { value: QrErrorCorrectionLevel; label: string; hint: string }[] = [
  { value: 'L', label: 'Baja', hint: '7% de recuperación' },
  { value: 'M', label: 'Media', hint: '15% de recuperación' },
  { value: 'Q', label: 'Alta', hint: '25% de recuperación' },
  { value: 'H', label: 'Máxima', hint: '30% de recuperación' },
]

export function QrCustomizer({ value, onChange, embedded = false }: QrCustomizerProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)

  const update = (patch: Partial<QrCustomization>) => {
    onChange({ ...value, ...patch })
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        update({ logoDataUrl: reader.result })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    update({ logoDataUrl: null })
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const handleReset = () => {
    onChange(DEFAULT_QR_CUSTOMIZATION)
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const wrapperClass = embedded
    ? 'pt-4'
    : 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'

  return (
    <div className={wrapperClass}>
      <div className={`flex flex-wrap items-center justify-between gap-3 ${embedded ? '' : ''}`}>
        {!embedded && <h3 className="text-base font-semibold text-slate-800">Opciones de diseño</h3>}
        {embedded && <p className="text-sm font-medium text-slate-700">Ajustes avanzados</p>}
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Restablecer diseño
        </button>
      </div>

      <div className={`space-y-6 ${embedded ? 'mt-4' : 'mt-6'}`}>
        <div>
          <label className="text-sm font-medium text-slate-700">Tamaño</label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {QR_SIZE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => update({ size: option.value })}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  value.size === option.value
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {option.label}
                <span className="mt-0.5 block text-xs font-normal text-slate-500">
                  {option.value}px
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Estilos de color</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {QR_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() =>
                  update({
                    foregroundColor: preset.foreground,
                    backgroundColor: preset.background,
                  })
                }
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                title={preset.name}
              >
                <span
                  className="h-5 w-5 rounded-full border border-slate-200"
                  style={{
                    background: `linear-gradient(135deg, ${preset.foreground} 50%, ${preset.background} 50%)`,
                  }}
                />
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="qr-fg-color" className="text-sm font-medium text-slate-700">
              Color del QR
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="qr-fg-color"
                type="color"
                value={value.foregroundColor}
                onChange={(event) => update({ foregroundColor: event.target.value })}
                className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
              />
              <input
                type="text"
                value={value.foregroundColor}
                onChange={(event) => update({ foregroundColor: event.target.value })}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="qr-bg-color" className="text-sm font-medium text-slate-700">
              Color de fondo
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="qr-bg-color"
                type="color"
                value={value.backgroundColor}
                onChange={(event) => update({ backgroundColor: event.target.value })}
                className="h-10 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
              />
              <input
                type="text"
                value={value.backgroundColor}
                onChange={(event) => update({ backgroundColor: event.target.value })}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="qr-margin" className="text-sm font-medium text-slate-700">
              Margen
            </label>
            <span className="text-sm text-slate-500">{value.margin}</span>
          </div>
          <input
            id="qr-margin"
            type="range"
            min={0}
            max={8}
            step={1}
            value={value.margin}
            onChange={(event) => update({ margin: Number(event.target.value) })}
            className="mt-2 w-full accent-indigo-600"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Corrección de errores</label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ERROR_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => update({ errorCorrectionLevel: level.value })}
                disabled={Boolean(value.logoDataUrl)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  (value.logoDataUrl ? level.value === 'H' : value.errorCorrectionLevel === level.value)
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="font-medium">{level.label}</span>
                <span className="mt-0.5 block text-xs font-normal text-slate-500">{level.hint}</span>
              </button>
            ))}
          </div>
          {value.logoDataUrl && (
            <p className="mt-2 text-xs text-slate-500">
              Con logo se usa corrección máxima (H) para mantener la lectura.
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Logo central (opcional)</label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input
              ref={logoInputRef}
              id="qr-logo-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
              onChange={handleLogoChange}
              className="hidden"
            />
            <label
              htmlFor="qr-logo-input"
              className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Subir logo
            </label>
            {value.logoDataUrl && (
              <>
                <img
                  src={value.logoDataUrl}
                  alt="Logo del QR"
                  className="h-12 w-12 rounded-lg border border-slate-200 bg-white object-contain p-1"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Quitar logo
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
