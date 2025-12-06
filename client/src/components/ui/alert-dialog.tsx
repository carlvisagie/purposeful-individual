import * as React from "react"

export function AlertDialog({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange?.(false)}>
      {children}
    </div>
  )
}

export function AlertDialogContent({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-white p-6 shadow-lg sm:rounded-lg ${className}`} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  )
}

export function AlertDialogHeader({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}>{children}</div>
}

export function AlertDialogTitle({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>
}

export function AlertDialogDescription({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
}

export function AlertDialogFooter({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`}>{children}</div>
}

export function AlertDialogAction({ children, onClick, className = "" }: { children: React.ReactNode, onClick?: () => void, className?: string }) {
  return <button onClick={onClick} className={`inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90 ${className}`}>{children}</button>
}

export function AlertDialogCancel({ children, onClick, className = "" }: { children: React.ReactNode, onClick?: () => void, className?: string }) {
  return <button onClick={onClick} className={`inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold hover:bg-gray-100 ${className}`}>{children}</button>
}
