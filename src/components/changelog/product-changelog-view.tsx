import { Calendar, ScrollText, Sparkles, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getProductChangelogData, type ProductChangelogTag } from "@/lib/product-changelog"
import { getI18n } from "@/lib/i18n"

const zhTagLabel: Record<ProductChangelogTag, string> = {
  feature: "新功能",
  fix: "修复",
  improvement: "优化",
  ux: "体验",
  performance: "性能",
  security: "安全",
  infra: "架构",
}

const enTagLabel: Record<ProductChangelogTag, string> = {
  feature: "Feature",
  fix: "Fix",
  improvement: "Improve",
  ux: "UX",
  performance: "Performance",
  security: "Security",
  infra: "Infra",
}

const tagColor: Record<ProductChangelogTag, string> = {
  feature: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  fix: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  improvement: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  ux: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  performance: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  security: "bg-red-500/10 text-red-700 dark:text-red-300",
  infra: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
}

export async function ProductChangelogView() {
  const { locale } = await getI18n()
  const tagLabel = locale === "en" ? enTagLabel : zhTagLabel
  const changelog = await getProductChangelogData(locale)

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
          <ScrollText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {locale === "en" ? "Product Changelog" : "产品更新日志"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {locale === "en"
              ? "Curated release notes for users, summarized from CHANGELOG.md."
              : "从 CHANGELOG.md 整理的用户可读版本更新，按标签快速查看重点。"}
          </p>
        </div>
      </div>

      {changelog.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {locale === "en" ? "No product changelog data yet." : "暂无可展示的产品更新数据。"}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {changelog.map((entry, index) => (
            <Card key={entry.version} className="relative overflow-hidden">
              {index === 0 ? (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
              ) : null}
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="font-mono text-sm">
                    {entry.version}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{entry.date}</span>
                  </div>
                  {index === 0 ? (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                      {locale === "en" ? "Latest" : "最新"}
                    </Badge>
                  ) : null}
                </div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  {locale === "en" ? "Release Summary" : "版本摘要"}
                </CardTitle>
                <CardDescription>{entry.summary}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2">
                  {entry.items.map((item, itemIndex) => (
                    <li
                      key={`${entry.version}-${itemIndex}`}
                      className="flex items-start gap-2 rounded-md border border-border/50 bg-muted/30 px-3 py-2"
                    >
                      <Badge variant="secondary" className={`mt-0.5 ${tagColor[item.tag]}`}>
                        <Tag className="mr-1 h-3 w-3" />
                        {tagLabel[item.tag]}
                      </Badge>
                      <span className="text-sm text-foreground">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}