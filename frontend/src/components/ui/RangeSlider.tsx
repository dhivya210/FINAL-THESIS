interface RangeSliderProps {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  description?: string
}

export const RangeSlider = ({ label, value, min = 0, max = 100, step = 5, onChange, description }: RangeSliderProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <span className="rounded-full bg-primary-500/10 px-3 py-1 text-sm font-semibold text-primary-600 dark:text-primary-200">
        {Math.round(value)}
      </span>
    </div>
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary-500 dark:bg-slate-800"
    />
    {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
  </div>
)
