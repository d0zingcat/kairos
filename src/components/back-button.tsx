"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n/i18n-provider"

export function BackButton() {
  const router = useRouter()
  const { t } = useI18n()
  return (
    <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5">
      <ArrowLeft className="h-4 w-4" />
      {t("common.back")}
    </Button>
  )
}
