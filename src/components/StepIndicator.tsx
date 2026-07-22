type Step = 1 | 2 | 3

type StepIndicatorProps = {
  currentStep: Step
  contentReady: boolean
}

const STEPS = [
  { step: 1 as const, label: 'Añade contenido' },
  { step: 2 as const, label: 'Personaliza' },
  { step: 3 as const, label: 'Descarga' },
]

export function StepIndicator({ currentStep, contentReady }: StepIndicatorProps) {
  return (
    <ol className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-0">
      {STEPS.map(({ step, label }, index) => {
        const isActive = step === currentStep
        const isDone =
          step < currentStep || (step === 2 && currentStep === 3) || (step === 1 && contentReady)

        return (
          <li key={step} className="flex items-center sm:flex-1 sm:justify-center">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isActive
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                    : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone && !isActive ? '✓' : step}
              </span>
              <div className="sm:hidden">
                <p
                  className={`text-sm font-medium ${isActive ? 'text-indigo-700' : 'text-slate-600'}`}
                >
                  {label}
                </p>
                {isActive && step === 1 && !contentReady && (
                  <p className="text-xs text-slate-500">Empieza aquí</p>
                )}
              </div>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  isActive ? 'text-indigo-700' : isDone ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-4 hidden h-0.5 flex-1 sm:block ${
                  step < currentStep ? 'bg-emerald-300' : 'bg-slate-200'
                }`}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
