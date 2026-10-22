import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ButtonVariant = 'primary' | 'secondary' | 'quiet'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
}

interface ButtonLinkProps {
  children: ReactNode
  to: string
  variant?: ButtonVariant
  'aria-label'?: string
}

function getButtonClassName(variant: ButtonVariant) {
  return `button button--${variant}`
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${getButtonClassName(variant)} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  children,
  to,
  variant = 'primary',
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={getButtonClassName(variant)} to={to} {...props}>
      {children}
    </Link>
  )
}
