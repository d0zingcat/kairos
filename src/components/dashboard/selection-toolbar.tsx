"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Trash2, X, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/components/i18n/i18n-provider"

interface SelectionToolbarProps {
    selectedCount: number
    onClear: () => void
    onDelete: () => void
    isDeleting?: boolean
}

export function SelectionToolbar({
    selectedCount,
    onClear,
    onDelete,
    isDeleting,
}: SelectionToolbarProps) {
    const { t } = useTranslation()
    if (selectedCount === 0) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border/50 bg-background/80 px-6 py-3 shadow-2xl backdrop-blur-md"
            >
                <div className="flex items-center gap-2 border-r border-border/50 pr-4">
                    <CheckSquare className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">{t("grid.selectedCount", { count: selectedCount })}</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="h-8 rounded-full px-4"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{isDeleting ? t("grid.deleting") : t("grid.batchDelete")}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onClear}
                        className="h-8 w-8 rounded-full"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
