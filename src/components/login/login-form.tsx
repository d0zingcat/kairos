"use client"

import { useActionState } from "react"
import { loginAction } from "@/lib/actions/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import { motion } from "framer-motion"

export function LoginForm() {
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
            输入访问密码或管理员密码
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              name="password"
              type="password"
              placeholder="输入密码"
              autoFocus
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
            {isPending ? "验证中..." : "解锁"}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
