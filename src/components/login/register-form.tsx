"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useActionState } from "react"
import { Lock, User } from "lucide-react"
import { registerAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm px-6"
      >
        <div className="mb-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600"
          >
            <span className="text-2xl font-bold text-white">K</span>
          </motion.div>
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-zinc-100">
            创建账号
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            首个注册用户将自动成为管理员
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              name="username"
              type="text"
              placeholder="用户名（小写字母/数字/_-.）"
              autoFocus
              autoComplete="username"
              className="border-zinc-800 bg-zinc-900 pl-10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-amber-500/50"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              name="password"
              type="password"
              placeholder="密码（至少 8 位）"
              autoComplete="new-password"
              className="border-zinc-800 bg-zinc-900 pl-10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-amber-500/50"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              name="confirmPassword"
              type="password"
              placeholder="确认密码"
              autoComplete="new-password"
              className="border-zinc-800 bg-zinc-900 pl-10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-amber-500/50"
            />
          </div>

          {state?.error ? (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-red-400"
            >
              {state.error}
            </motion.p>
          ) : null}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 font-medium text-white transition-all hover:from-amber-600 hover:to-orange-700 disabled:opacity-50"
          >
            {isPending ? "创建中..." : "注册并进入"}
          </Button>

          <p className="text-center text-xs text-zinc-500">
            已有账号？
            <Link href="/login" className="ml-1 text-amber-400 hover:text-amber-300">
              去登录
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
