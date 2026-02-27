"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { CommandPalette } from "./command-palette"

interface CommandPaletteContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const CommandPaletteContext = createContext<CommandPaletteContextType>({
  open: false,
  setOpen: () => {},
})

export function useCommandPalette() {
  return useContext(CommandPaletteContext)
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
      {mounted ? <CommandPalette open={open} onOpenChange={setOpen} /> : null}
    </CommandPaletteContext.Provider>
  )
}
