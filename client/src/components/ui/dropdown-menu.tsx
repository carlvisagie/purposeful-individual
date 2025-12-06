import * as React from "react"

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block">{children}</div>
}

export function DropdownMenuTrigger({ children, asChild, className = "" }: { children: React.ReactNode, asChild?: boolean, className?: string }) {
  return <div className={className}>{children}</div>
}

export function DropdownMenuContent({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 ${className}`}>
      <div className="py-1">{children}</div>
    </div>
  )
}

export function DropdownMenuItem({ children, onClick, className = "" }: { children: React.ReactNode, onClick?: () => void, className?: string }) {
  return (
    <button onClick={onClick} className={`block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 ${className}`}>
      {children}
    </button>
  )
}

export function DropdownMenuLabel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <div className={`px-4 py-2 text-sm font-semibold text-gray-900 ${className}`}>{children}</div>
}

export function DropdownMenuSeparator({ className = "" }: { className?: string }) {
  return <div className={`my-1 h-px bg-gray-200 ${className}`} />
}
