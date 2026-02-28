"use client"

import { useActionState } from "react"
import { loginAction } from "@/lib/actions/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, User } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

type LoginFormProps = {
  next?: string
}

export function LoginForm({ next }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, null)

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
            Kairos
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            输入你的账号密码
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <input name="next" type="hidden" value={next ?? ""} />

          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              name="username"
              type="text"
              placeholder="用户名"
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
              placeholder="密码"
              autoComplete="current-password"
              className="border-zinc-800 bg-zinc-900 pl-10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-amber-500/50"
            />
          </div>

          {state?.error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-red-400"
            >
              {state.error}
            </motion.p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 font-medium text-white transition-all hover:from-amber-600 hover:to-orange-700 disabled:opacity-50"
          >
            {isPending ? "登录中..." : "登录"}
          </Button>

          <p className="text-center text-xs text-zinc-500">
            没有账号？
            <Link href="/register" className="ml-1 text-amber-400 hover:text-amber-300">
              注册一个
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
