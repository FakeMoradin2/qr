import { useState } from 'react'
import { QrCustomizer } from './QrCustomizer'
import type { QrCustomization } from '../lib/qrOptions'

type QrCustomizeSectionProps = {
  value: QrCustomization
  onChange: (value: QrCustomization) => void
  defaultOpen?: boolean
}

export function QrCustomizeSection({ value, onChange, defaultOpen = false }: QrCustomizeSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-slate-50"
        aria-expanded={isOpen}
      >
        <div>
          <p className="text-base font-semibold text-slate-800">
            Personalizar diseño
            <span className="ml-2 text-sm font-normal text-slate-500">(opcional)</span>
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Colores, tamaño, logo y más. El QR se actualiza en la vista previa.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
          {isOpen ? 'Ocultar' : 'Mostrar'}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 px-6 pb-6 pt-2">
          <QrCustomizer value={value} onChange={onChange} embedded />
        </div>
      )}
    </section>
  )
}
