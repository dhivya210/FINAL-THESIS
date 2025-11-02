import { Switch } from '@headlessui/react'
import { twMerge } from 'tailwind-merge'

interface ToggleProps {
  enabled: boolean
  onChange: (value: boolean) => void
  label: string
  hint?: string
}

export const Toggle = ({ enabled, onChange, label, hint }: ToggleProps) => (
  <Switch.Group as="div" className="flex items-center justify-between">
    <span className="flex flex-col">
      <Switch.Label className="font-medium text-slate-800 dark:text-slate-100">{label}</Switch.Label>
      {hint && <Switch.Description className="text-sm text-slate-500 dark:text-slate-400">{hint}</Switch.Description>}
    </span>
    <Switch
      checked={enabled}
      onChange={onChange}
      className={twMerge(
        'relative inline-flex h-6 w-12 items-center rounded-full transition',
        enabled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'
      )}
    >
      <span
        className={twMerge(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </Switch>
  </Switch.Group>
)
