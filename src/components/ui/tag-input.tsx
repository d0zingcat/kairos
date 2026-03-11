import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const COLORS = [
    "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
    "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
    "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
    "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20",
    "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20",
    "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20",
    "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20",
    "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
    "bg-fuchsia-500/10 text-fuchsia-500 hover:bg-fuchsia-500/20",
    "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20",
    "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
]

function getTagColor(tag: string) {
    let hash = 0
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash)
    }
    return COLORS[Math.abs(hash) % COLORS.length]
}

interface TagInputProps {
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
    colored?: boolean
}

export function TagInput({ value, onChange, placeholder, colored = true }: TagInputProps) {
    const [inputValue, setInputValue] = React.useState("")

    const commitInputValue = React.useCallback(() => {
        const newTag = inputValue.trim()
        if (!newTag || value.includes(newTag)) {
            return false
        }

        onChange([...value, newTag])
        return true
    }, [inputValue, onChange, value])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Ignore Enter key during IME composition (e.g., Chinese Pinyin input)
        if (e.nativeEvent.isComposing) {
            return
        }

        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            commitInputValue()
            setInputValue("")
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1))
        }
    }

    const handleBlur = () => {
        if (commitInputValue()) {
            setInputValue("")
        }
    }

    // Prevent input keys from triggering parent forms or dialogs (e.g. 1-5 quick rating)
    const handleKeyDownCapture = (e: React.KeyboardEvent) => {
        e.stopPropagation()
    }

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove))
    }

    return (
        <div className="flex min-h-[40px] flex-wrap items-center gap-2 rounded-md border border-input bg-card px-3 py-1.5 text-sm shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring">
            {value.map((tag) => (
                <Badge
                    key={tag}
                    variant="secondary"
                    className={cn("rounded px-2 py-0.5 font-normal", colored && getTagColor(tag))}
                >
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            removeTag(tag)
                        }}
                        className="ml-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tag}</span>
                    </button>
                </Badge>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyDownCapture={handleKeyDownCapture}
                onBlur={handleBlur}
                placeholder={value.length === 0 ? placeholder : ""}
                className="flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none min-w-[120px] text-foreground"
            />
        </div>
    )
}
