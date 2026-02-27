"use client"

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react"
import { CommandPalette } from "./command-palette"

interface CommandPaletteContextType {
  open: boolean
  setOpen: (open: boolean) => void
  canEdit: boolean
}

const CommandPaletteContext = createContext<CommandPaletteContextType>({
  open: false,
  setOpen: () => {},
  canEdit: false,
})

export function useCommandPalette() {
  return useContext(CommandPaletteContext)
}

export function CommandPaletteProvider({
  children,
  canEdit,
}: {
  children: ReactNode
  canEdit: boolean
}) {
  const [open, setOpen] = useState(false)
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen, canEdit }}>
      {children}
      {isClient && canEdit ? <CommandPalette open={open} onOpenChange={setOpen} /> : null}
    </CommandPaletteContext.Provider>
  )
}
