import { getAccessState } from "@/lib/access"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login/login-form"
import { ADMIN_ONLY_PREFIXES } from "@/lib/constants"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const nextPath = typeof params?.next === "string" ? params.next : undefined
  const access = await getAccessState()
  // 只有当用户已经可以访问 dashboard 时才重定向
  // 避免与 dashboard/layout.tsx 的重定向逻辑形成循环
  if (access.hasSession) {
    let target = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard"

    // 如果不是管理员，且目标路径是管理员路径，则强制跳转到 dashboard
    const isAdminPath = typeof target === "string" && ADMIN_ONLY_PREFIXES.some(prefix => target.startsWith(prefix))
    if (isAdminPath && !access.isAdmin) {
      target = "/dashboard"
    }

    redirect(target)
  }

  return <LoginForm next={nextPath} />
}
