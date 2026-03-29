import { ProductChangelogView } from "@/components/changelog/product-changelog-view"
import { BackButton } from "@/components/back-button"

export default function PublicChangelogPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12 sm:px-8 lg:px-10">
      <div className="mb-4">
        <BackButton />
      </div>
      <ProductChangelogView />
    </main>
  )
}