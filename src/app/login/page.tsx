import { verifyAdminSession, verifyViewerSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login/login-form"

export default async function LoginPage() {
  const isAdmin = await verifyAdminSession()
  const isViewer = isAdmin ? true : await verifyViewerSession()

  if (isAdmin || isViewer) {
    redirect("/dashboard")
  }

  return <LoginForm />
}
