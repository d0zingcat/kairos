import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const nextPath = typeof params?.next === "string" ? params.next : undefined
  const hasSession = await verifySession()
  if (hasSession) {
    redirect(nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard")
  }

  return <LoginForm next={nextPath} />
}
