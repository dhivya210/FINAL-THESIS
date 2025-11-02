import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white shadow-glow hover:bg-primary-700 focus-visible:ring-primary-200 dark:focus-visible:ring-primary-500/40',
  secondary:
    'bg-white text-primary-600 border border-primary-100 hover:bg-primary-50 dark:bg-slate-900 dark:border-slate-700 dark:text-primary-100',
  ghost:
    'bg-transparent hover:bg-primary-50/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base'
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={twMerge(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
)

Button.displayName = 'Button'
