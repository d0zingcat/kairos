import { ProductChangelogView } from "@/components/changelog/product-changelog-view"
import { BackButton } from "@/components/back-button"

export default async function ChangelogPage() {
  return (
    <div>
      <div className="mb-4">
        <BackButton />
      </div>
      <ProductChangelogView />
    </div>
  )
}
