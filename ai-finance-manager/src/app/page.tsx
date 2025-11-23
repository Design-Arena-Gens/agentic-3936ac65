"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowUpRight, Download, FileText, LineChart, Sparkles, Upload } from "lucide-react";
import { Card } from "@/components/cards";
import {
  calculateGoalInsights,
  calculateSummary,
  getGoalPriorityLabel,
  getPeriodTransactions,
  groupTransactionsByCategory,
  Period,
} from "@/lib/finance";
import { exportToExcel, exportToPdf } from "@/lib/exporters";
import { generateAdvisorInsights } from "@/lib/advisor";
import { SavingsGoal, Transaction } from "@/types/finance";

const presetTransactions: Transaction[] = [
  {
    id: "t-1",
    type: "income",
    amount: 3200,
    category: "Income",
    date: format(new Date(), "yyyy-MM-01"),
    note: "Salary",
    source: "manual",
  },
  {
    id: "t-2",
    type: "expense",
    amount: 680,
    category: "Housing",
    date: format(new Date(), "yyyy-MM-03"),
    note: "Rent",
    source: "manual",
  },
  {
    id: "t-3",
    type: "expense",
    amount: 120,
    category: "Food",
    date: format(new Date(), "yyyy-MM-06"),
    note: "Groceries",
    source: "manual",
  },
  {
    id: "t-4",
    type: "expense",
    amount: 90,
    category: "Transport",
    date: format(new Date(), "yyyy-MM-05"),
    note: "Transit pass",
    source: "manual",
  },
  {
    id: "t-5",
    type: "expense",
    amount: 210,
    category: "Shopping",
    date: format(new Date(), "yyyy-MM-07"),
    note: "Household essentials",
    source: "manual",
  },
];

const presetGoals: SavingsGoal[] = [
  {
    id: "g-1",
    name: "Emergency Fund",
    targetAmount: 5000,
    currentAmount: 2100,
    priority: "high",
    targetDate: format(new Date(new Date().setMonth(new Date().getMonth() + 4)), "yyyy-MM-dd"),
  },
  {
    id: "g-2",
    name: "New Laptop",
    targetAmount: 1800,
    currentAmount: 550,
    priority: "medium",
    targetDate: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), "yyyy-MM-dd"),
  },
];

const categories = [
  "Income",
  "Housing",
  "Food",
  "Transport",
  "Utilities",
  "Shopping",
  "Health",
  "Entertainment",
  "Other",
] as const;

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>(presetTransactions);
  const [goals, setGoals] = useState<SavingsGoal[]>(presetGoals);
  const [period, setPeriod] = useState<Period>("weekly");
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredTransactions = useMemo(
    () => getPeriodTransactions(transactions, period),
    [transactions, period],
  );

  const summary = useMemo(
    () => calculateSummary(filteredTransactions.length ? filteredTransactions : transactions),
    [filteredTransactions, transactions],
  );

  const categorySummary = useMemo(
    () => groupTransactionsByCategory(filteredTransactions.length ? filteredTransactions : transactions),
    [filteredTransactions, transactions],
  );

  const goalInsights = useMemo(() => calculateGoalInsights(goals), [goals]);

  const aiInsights = useMemo(
    () =>
      generateAdvisorInsights({
        transactions,
        goals,
      }),
    [transactions, goals],
  );

  async function handleManualSubmit(formData: FormData) {
    const amount = Number(formData.get("amount"));
    if (!amount || Number.isNaN(amount)) return;
    const type = (formData.get("type") as Transaction["type"]) ?? "expense";
    const category = (formData.get("category") as Transaction["category"]) ?? "Other";
    const date = (formData.get("date") as string) || format(new Date(), "yyyy-MM-dd");
    const note = (formData.get("note") as string) || "";

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount,
      category,
      date,
      note,
      source: "manual",
    };

    setTransactions((current) => [newTransaction, ...current]);
  }

  async function simulateReceiptExtraction(file: File) {
    setIsGenerating(true);
    return new Promise<Transaction[]>((resolve) => {
      setTimeout(() => {
        const amountCandidate = Number(
          file.name
            .replace(/[^\d.]/g, " ")
            .split(" ")
            .filter(Boolean)
            .at(0),
        );

        const amount =
          !Number.isNaN(amountCandidate) && amountCandidate > 0
            ? amountCandidate
            : Number((Math.random() * 120 + 20).toFixed(2));

        const randomCategory = categories[Math.floor(Math.random() * (categories.length - 1)) + 1];
        resolve([
          {
            id: crypto.randomUUID(),
            type: "expense",
            amount,
            category: randomCategory,
            date: format(new Date(), "yyyy-MM-dd"),
            note: `Auto parsed from ${file.name}`,
            source: "receipt",
          },
        ]);
        setIsGenerating(false);
      }, 1500);
    });
  }

  async function handleReceiptUpload(formData: FormData) {
    const file = formData.get("receipt") as File | null;
    if (!file) return;
    const extracted = await simulateReceiptExtraction(file);
    setTransactions((current) => [...extracted, ...current]);
  }

  function handleGoalCreate(formData: FormData) {
    const name = (formData.get("name") as string) || "New Goal";
    const targetAmount = Number(formData.get("targetAmount"));
    const targetDate =
      (formData.get("targetDate") as string) ||
      format(new Date(new Date().setMonth(new Date().getMonth() + 3)), "yyyy-MM-dd");

    if (!targetAmount || Number.isNaN(targetAmount)) return;

    const priority = (formData.get("priority") as SavingsGoal["priority"]) ?? "medium";

    const newGoal: SavingsGoal = {
      id: crypto.randomUUID(),
      name,
      targetAmount,
      currentAmount: 0,
      targetDate,
      priority,
    };

    setGoals((current) => [newGoal, ...current]);
  }

  function handleGoalProgressUpdate(goalId: string, delta: number) {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              currentAmount: Math.min(goal.targetAmount, Math.max(0, goal.currentAmount + delta)),
            }
          : goal,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-zinc-50">
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/10 p-10 shadow-2xl shadow-slate-950/50 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                AuraLedger
              </p>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Your AI-native expense co-pilot for smarter saving habits.
              </h1>
              <p className="mt-4 max-w-2xl text-base text-zinc-200">
                Track every dollar, surface hidden spending habits, and get personalised guidance that
                keeps your goals visible and achievable. Designed for busy professionals who want clarity
                without spreadsheets.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-black/30 px-6 py-5 text-sm text-zinc-200 shadow-lg">
              <p className="font-semibold text-emerald-200">Audience Snapshot</p>
              <ul className="mt-3 space-y-2">
                <li>• Young professionals (25–40) tracking hybrid incomes</li>
                <li>• Freelancers balancing irregular cashflow</li>
                <li>• Households building emergency and lifestyle goals</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setPeriod(period === "weekly" ? "monthly" : "weekly")}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <LineChart className="h-4 w-4" />
              Toggle to {period === "weekly" ? "monthly" : "weekly"} view
            </button>
            <button
              type="button"
              onClick={() => exportToExcel({ transactions, goals })}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </button>
            <button
              type="button"
              onClick={() => exportToPdf({ transactions, goals })}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card title="Net Balance" description={`Currently ${period} view`}>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-semibold text-emerald-200">
                ${summary.balance.toFixed(2)}
              </p>
              <ArrowUpRight className="h-8 w-8 text-emerald-200" />
            </div>
            <p className="text-xs text-zinc-400">
              Income ${summary.income.toFixed(2)} · Expenses ${summary.expenses.toFixed(2)}
            </p>
          </Card>
          <Card title="Average Daily Spend">
            <p className="text-3xl font-semibold">${summary.burnRate.toFixed(2)}</p>
            <p className="text-xs text-zinc-400">
              AI monitors this metric to surface trend shifts in habit-heavy categories.
            </p>
          </Card>
          <Card
            title="Savings Progress"
            description="Aggregated goal funding"
            className="xl:col-span-2"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-400">Total Target</p>
                <p className="mt-1 text-xl font-semibold">${goalInsights.totalTarget.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-400">Actual Saved</p>
                <p className="mt-1 text-xl font-semibold text-emerald-200">
                  ${goalInsights.totalSaved.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-zinc-400">Avg. Completion</p>
                <p className="mt-1 text-xl font-semibold">
                  {(goalInsights.averageProgress * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          <Card
            title="Log Expense Manually"
            description="Add earnings or outflows in under 30 seconds."
            className="lg:col-span-2"
          >
            <form
              action={handleManualSubmit}
              className="grid grid-cols-1 gap-3 text-sm"
              autoComplete="off"
            >
              <div className="grid gap-2">
                <label htmlFor="amount" className="text-xs uppercase tracking-widest text-zinc-400">
                  Amount
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 45.60"
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-400">Type</label>
                  <select
                    name="type"
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-emerald-300 focus:outline-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs uppercase tracking-widest text-zinc-400">
                    Category
                  </label>
                  <select
                    name="category"
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-emerald-300 focus:outline-none"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-emerald-300 focus:outline-none"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-widest text-zinc-400">
                  Note (optional)
                </label>
                <textarea
                  name="note"
                  rows={2}
                  placeholder="Add helpful context"
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-200"
              >
                Add transaction
              </button>
            </form>
          </Card>

          <Card
            title="Smart Receipt Intake"
            description="Drop a photo or PDF and let AuraLedger detect amounts."
            className="lg:col-span-3"
          >
            <form action={handleReceiptUpload} className="space-y-3">
              <label
                htmlFor="receipt"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200/40 bg-emerald-300/5 px-6 py-10 text-center transition hover:border-emerald-200 hover:bg-emerald-300/10"
              >
                <Upload className="mb-3 h-10 w-10 text-emerald-200" />
                <span className="text-sm font-medium">
                  Tap to upload or drag and drop receipt image/PDF
                </span>
                <span className="mt-1 text-xs text-zinc-400">
                  AuraLedger classifies line items and syncs them to your spending feed.
                </span>
                <input
                  type="file"
                  id="receipt"
                  name="receipt"
                  accept="image/*,application/pdf"
                  className="hidden"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-200" />
                    Analysing receipt…
                  </span>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-emerald-200" />
                    Run AI ingestion
                  </>
                )}
              </button>
            </form>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-zinc-300">
                Receipts are parsed with on-device OCR before being categorised by AuraLedger&apos;s
                spend graph to avoid manual data entry.
              </p>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          <Card
            title="Spending Pulse"
            description="Live view of where your money goes."
            className="lg:col-span-3"
          >
            <ul className="space-y-2">
              {Object.entries(categorySummary).map(([category, details]) => (
                <li
                  key={category}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{category}</p>
                    <p className="text-xs text-zinc-400">
                      {details.count} transaction{details.count > 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-200">
                    ${details.total.toFixed(2)}
                  </p>
                </li>
              ))}
              {!Object.keys(categorySummary).length && (
                <p className="text-sm text-zinc-400">
                  Log your first expense to populate category intelligence.
                </p>
              )}
            </ul>
          </Card>

          <Card
            title="Recent Activity"
            description="AI tags income vs expense, ready for export."
            className="lg:col-span-2"
          >
            <ul className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <li key={transaction.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {transaction.category} · ${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {transaction.date} • {transaction.source === "receipt" ? "AI receipt" : "Manual"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      transaction.type === "income"
                        ? "bg-emerald-300 text-slate-950"
                        : "bg-rose-200/80 text-rose-900"
                    }`}
                  >
                    {transaction.type}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          <Card
            title="Savings Goals"
            description="Prioritise the milestones that matter."
            className="lg:col-span-3"
          >
            <form action={handleGoalCreate} className="grid grid-cols-1 gap-3 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-widest text-zinc-400">
                    Goal name
                  </label>
                  <input
                    name="name"
                    placeholder="E.g. Down payment"
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-zinc-400">
                    Target amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="targetAmount"
                    placeholder="5000"
                    required
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-widest text-zinc-400">
                    Target date
                  </label>
                  <input
                    name="targetDate"
                    type="date"
                    defaultValue={format(new Date(new Date().setMonth(new Date().getMonth() + 6)), "yyyy-MM-dd")}
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-emerald-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-zinc-400">
                    Priority
                  </label>
                  <select
                    name="priority"
                    className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white focus:border-emerald-300 focus:outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-200"
              >
                Create goal
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {goals.map((goal) => {
                const progress = goal.currentAmount / goal.targetAmount;
                return (
                  <div
                    key={goal.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{goal.name}</p>
                        <p className="text-xs text-zinc-400">
                          Target ${goal.targetAmount.toFixed(2)} • Due {goal.targetDate}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                        {getGoalPriorityLabel(goal.priority)}
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-300 transition-all"
                        style={{ width: `${Math.min(100, progress * 100)}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-300">
                      <span>Saved ${goal.currentAmount.toFixed(2)}</span>
                      <span>{Math.round(progress * 100)}% complete</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-semibold text-slate-950 transition hover:bg-emerald-200"
                        onClick={() => handleGoalProgressUpdate(goal.id, goal.targetAmount * 0.05)}
                      >
                        Add 5%
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/30"
                        onClick={() => handleGoalProgressUpdate(goal.id, -(goal.targetAmount * 0.05))}
                      >
                        Reduce
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card
            title="AI Financial Assistant"
            description="AuraLedger monitors cashflow shifts and shares quick wins."
            className="lg:col-span-2"
          >
            <div className="rounded-2xl border border-emerald-200/20 bg-emerald-400/10 p-4">
              <p className="text-sm font-semibold text-emerald-100">{aiInsights.headline}</p>
              <p className="mt-2 text-xs text-emerald-200">
                Income ${aiInsights.summary.income.toFixed(2)} · Expenses $
                {aiInsights.summary.expenses.toFixed(2)} · Net ${aiInsights.summary.balance.toFixed(2)}
              </p>
            </div>
            <ul className="mt-4 space-y-3">
              {aiInsights.statements.map((statement, index) => (
                <li
                  key={`${statement}-${index}`}
                  className="rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-200"
                >
                  {statement}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <footer className="rounded-3xl border border-white/10 bg-white/10 p-8 text-sm text-zinc-300">
          <h2 className="text-xl font-semibold text-white">Execution roadmap</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-2">
            <li className="rounded-2xl border border-white/5 bg-black/30 p-4">
              <h3 className="font-semibold text-white">Phase 1 · Product Blueprint</h3>
              <p className="mt-2 text-xs text-zinc-400">
                Validate personas, solidify data model, map AI prompts, and build design system tokens.
              </p>
            </li>
            <li className="rounded-2xl border border-white/5 bg-black/30 p-4">
              <h3 className="font-semibold text-white">Phase 2 · Core Intelligence</h3>
              <p className="mt-2 text-xs text-zinc-400">
                Implement OCR & AI ingestion services, budgeting engine, and secure auth with encrypted
                storage.
              </p>
            </li>
            <li className="rounded-2xl border border-white/5 bg-black/30 p-4">
              <h3 className="font-semibold text-white">Phase 3 · Experience Layer</h3>
              <p className="mt-2 text-xs text-zinc-400">
                Ship mobile-first clients, real-time dashboards, personalised advisor feed, and export
                workflows.
              </p>
            </li>
            <li className="rounded-2xl border border-white/5 bg-black/30 p-4">
              <h3 className="font-semibold text-white">Phase 4 · Growth & Compliance</h3>
              <p className="mt-2 text-xs text-zinc-400">
                Launch premium features, open API for partners, and certify regulatory compliance.
              </p>
            </li>
          </ol>
        </footer>
      </div>
    </div>
  );
}
