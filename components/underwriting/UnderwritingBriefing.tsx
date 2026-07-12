import { FileSearch, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UNDERWRITING_CATEGORIES, type UnderwritingBriefingItem } from "@/lib/underwriting";

export function UnderwritingBriefing({ items }: { items: UnderwritingBriefingItem[] }) {
  const referCount = items.filter((item) => item.status === "Refer to Deal Maker").length;

  return (
    <div className="space-y-6">
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-2 py-4 text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="font-semibold text-primary">AI Underwriting Briefing</span>
          </div>
          <span className="text-muted-foreground">
            <span className="font-medium text-primary">{items.length - referCount}</span> of {items.length} standard
            questions answered directly from the submission package
          </span>
          {referCount > 0 && (
            <span className="text-muted-foreground">
              <span className="font-medium text-warning">{referCount}</span> referred to the deal maker
            </span>
          )}
        </CardContent>
      </Card>

      {UNDERWRITING_CATEGORIES.map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        if (categoryItems.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>
                {categoryItems.length} question{categoryItems.length === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-border">
              {categoryItems.map((item) => (
                <div key={item.number} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-medium text-primary">
                      <span className="mr-2 font-mono text-xs text-muted-foreground">Q{item.number}</span>
                      {item.question}
                    </p>
                    <Badge variant={item.status === "Verified" ? "success" : "warning"}>{item.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs italic text-muted-foreground">{item.purpose}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground/80">
                    <FileSearch className="h-3 w-3" aria-hidden="true" />
                    Source: {item.source}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
