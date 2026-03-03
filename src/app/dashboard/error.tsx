"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Dashboard Error Boundary:", error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-6">
            <div className="p-4 bg-amber-500/10 rounded-full">
                <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>

            <div className="space-y-2">
                <h2 className="text-xl font-semibold">无法加载看板数据</h2>
                <p className="text-muted-foreground max-w-sm">
                    我们在加载该页面时遇到了问题。这通常是由于网络波动或临时服务器故障引起的。
                </p>
            </div>

            <Button
                variant="secondary"
                onClick={() => reset()}
                className="gap-2"
            >
                <RefreshCw className="w-4 h-4" />
                重新尝试
            </Button>
        </div>
    )
}
