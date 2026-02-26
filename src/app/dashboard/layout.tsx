import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard/nav"
import { CommandPaletteProvider } from "@/components/command-palette/provider"
import { TooltipProvider } from "@/components/ui/tooltip"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuth = await verifySession()
  if (!isAuth) {
    redirect("/login")
  }

  return (
    <TooltipProvider>
      <CommandPaletteProvider>
        <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
          <DashboardNav />
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
