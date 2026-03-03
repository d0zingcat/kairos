"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Global Error Boundary:", error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="p-4 bg-red-500/10 rounded-full">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">出错了</h1>
                    <p className="text-muted-foreground">
                        抱歉，应用程序遇到了意外错误。
                    </p>
                    {error.digest && (
                        <p className="text-xs font-mono text-muted-foreground/60 uppercase">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => reset()}
                        className="gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        重试
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                    >
                        返回首页
                    </Button>
                </div>
            </div>
        </div>
    )
}
