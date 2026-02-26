"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
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
  const [open, setOpen] = useState(false)

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  )
}
