import { getAccessState } from "@/lib/access"
import { redirect } from "next/navigation"
import { RegisterForm } from "@/components/login/register-form"

export default async function RegisterPage() {
  const access = await getAccessState()
  // 只有当用户已经可以访问 dashboard 时才重定向
  if (access.canView && access.hasSession) {
    redirect("/dashboard")
  }

  return <RegisterForm />
}
