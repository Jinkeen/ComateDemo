import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: 'primary' | 'secondary' }
export function Button({ children, variant = 'primary', className = '', ...props }: Props) {
  return <button className={`button button--${variant} ${className}`} {...props}>{children}</button>
}
