import { ReactNode } from 'react'

interface KbdProps {
  children: ReactNode
  className?: string
}

export default function Kbd({ children, className = '' }: KbdProps) {
  return (
    <kbd
      className={`
        inline-flex items-center justify-center
        min-w-[2rem] h-7 px-2
        bg-gradient-to-b from-gray-50 to-gray-100
        border border-gray-300
        rounded-md
        shadow-sm
        text-xs font-semibold text-gray-700
        ${className}
      `}
    >
      {children}
    </kbd>
  )
}
