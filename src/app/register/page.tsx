import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RegisterForm } from "@/components/login/register-form"

export default async function RegisterPage() {
  const hasSession = await verifySession()
  if (hasSession) {
    redirect("/dashboard")
  }

  return <RegisterForm />
}
