"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, Clock, DollarSign, PlusCircle, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KpiCard, KpiRow } from "@/components/dashboard/KpiCard";
import { DealPortfolioCard } from "@/components/broker/DealPortfolioCard";
import { RecentActivityPanel } from "@/components/dashboard/RecentActivityPanel";
import { QuickActionsPanel } from "@/components/dashboard/QuickActionsPanel";
import { formatCurrency } from "@/lib/premium";
import type { BrokerPortfolioKpis, RecentActivityItem } from "@/lib/kpi";
import type { Deal } from "@/lib/types";

type SortMode = "newest" | "value";

interface DealPortfolioBoardProps {
  deals: Deal[];
  kpis: BrokerPortfolioKpis;
  recentActivity: RecentActivityItem[];
}

export function DealPortfolioBoard({ deals, kpis, recentActivity }: DealPortfolioBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  const visibleDeals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? deals.filter(
          (deal) => deal.target.companyName.toLowerCase().includes(query) || deal.target.sector.toLowerCase().includes(query),
        )
      : deals;

    return [...filtered].sort((a, b) =>
      sortMode === "value"
        ? b.financials.enterpriseValue - a.financials.enterpriseValue
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [deals, searchQuery, sortMode]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Deal Portfolio</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your W&amp;I insurance deals.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search deals…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-56 pl-8"
              aria-label="Search deals"
            />
          </div>
          <Button asChild>
            <Link href="/deals/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Deal
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <KpiRow>
          <KpiCard label="Total Deal Value" value={formatCurrency(kpis.totalDealValue, "USD")} icon={DollarSign} />
          <KpiCard label="Active Deals" value={String(kpis.activeDeals)} icon={Briefcase} />
          <KpiCard label="Total Bids" value={String(kpis.totalBids)} icon={Users} />
          <KpiCard
            label="Avg. Time to Close"
            value={kpis.averageDaysToClose !== null ? `${kpis.averageDaysToClose}d` : "—"}
            icon={Clock}
          />
        </KpiRow>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-primary">Active Deals</h2>
            <div className="flex items-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => setSortMode((mode) => (mode === "newest" ? "value" : "newest"))}
                className="font-medium text-accent hover:text-accent-hover"
              >
                Sort: {sortMode === "newest" ? "Newest" : "Highest Value"}
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            {visibleDeals.map((deal, index) => (
              <DealPortfolioCard key={deal.id} deal={deal} index={index} />
            ))}
            {visibleDeals.length === 0 && (
              <div className="rounded-lg border border-border bg-white py-10 text-center text-sm text-muted-foreground">
                No deals match your search.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <RecentActivityPanel items={recentActivity} />
          <QuickActionsPanel />
        </div>
      </div>
    </div>
  );
}
