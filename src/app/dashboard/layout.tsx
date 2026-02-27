import { getAccessState } from "@/lib/access"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/nav"
import { CommandPaletteProvider } from "@/components/command-palette/provider"
import { TooltipProvider } from "@/components/ui/tooltip"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const access = await getAccessState()
  if (!access.canView) {
    redirect("/login")
  }

  return (
    <TooltipProvider>
      <CommandPaletteProvider canEdit={access.canEdit}>
        <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
          <DashboardNav canEdit={access.canEdit} hasSession={access.hasSession} />
          <main className="pb-20 pt-16 md:pb-8 md:pl-64 md:pt-0">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </CommandPaletteProvider>
    </TooltipProvider>
  )
}
