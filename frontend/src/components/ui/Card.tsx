import { twMerge } from 'tailwind-merge'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padded?: boolean
}

export const Card = ({ children, className, padded = true }: CardProps) => {
  const content = padded ? <div className="p-6 md:p-8">{children}</div> : children
  return <div className={twMerge('glass-panel card-hover', className)}>{content}</div>
}
