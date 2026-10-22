import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  const classes = ['page-container', className].filter(Boolean).join(' ')

  return <div className={classes}>{children}</div>
}
