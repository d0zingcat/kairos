"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useActionState } from "react"
import { Lock, User } from "lucide-react"
import { registerAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/components/i18n/i18n-provider"

export function RegisterForm() {
  const { t } = useI18n()
  const [state, formAction, isPending] = useActionState(registerAction, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
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
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground">
            {t("login.createAccount")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("login.firstUserNote")}
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="username"
              type="text"
              placeholder={t("login.usernamePlaceholder")}
              autoFocus
              autoComplete="username"
              className="border-border bg-card pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-500/50"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="password"
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              autoComplete="new-password"
              className="border-border bg-card pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-500/50"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="confirmPassword"
              type="password"
              placeholder={t("login.confirmPassword")}
              autoComplete="new-password"
              className="border-border bg-card pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-amber-500/50"
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
            {isPending ? t("login.submittingRegister") : t("login.registerAndEnter")}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {t("login.hasAccount")}
            <Link href="/login" className="ml-1 text-amber-400 hover:text-amber-300">
              {t("login.goLogin")}
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
