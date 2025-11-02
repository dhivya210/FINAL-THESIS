interface ProgressBarProps {
  value: number
}

export const ProgressBar = ({ value }: ProgressBarProps) => (
  <div className="w-full rounded-full bg-slate-200/60 dark:bg-slate-800">
    <div
      className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-sky-500 transition-all duration-500"
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
)
