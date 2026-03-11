import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TagInput } from "@/components/ui/tag-input"

describe("TagInput", () => {
  it("commits a pending tag on blur", () => {
    const handleChange = vi.fn()

    render(<TagInput value={[]} onChange={handleChange} placeholder="Type category" />)

    const input = screen.getByPlaceholderText("Type category")
    fireEvent.change(input, { target: { value: "History" } })
    fireEvent.blur(input)

    expect(handleChange).toHaveBeenCalledWith(["History"])
  })

  it("does not duplicate an existing tag on blur", () => {
    const handleChange = vi.fn()

    render(<TagInput value={["History"]} onChange={handleChange} placeholder="Type category" />)

    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "History" } })
    fireEvent.blur(input)

    expect(handleChange).not.toHaveBeenCalled()
  })

  it("does not commit a partial tag while IME composition is active", () => {
    const handleChange = vi.fn()

    render(<TagInput value={[]} onChange={handleChange} placeholder="Type category" />)

    const input = screen.getByPlaceholderText("Type category")
    fireEvent.change(input, { target: { value: "han" } })
    fireEvent.compositionStart(input)
    fireEvent.blur(input)

    expect(handleChange).not.toHaveBeenCalled()
  })
})