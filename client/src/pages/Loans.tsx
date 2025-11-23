import React, { useContext, useMemo, useState } from "react";
import { StoreContext } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useLoans, useCreateLoan, useAddRepayment, useRepayments, useLoansSummary, useRepaymentsByStore, useDeleteLoan } from "@/integrations/supabase/hooks/loans";
import NoStoreMessage from "@/components/NoStoreMessage";
import { Loan, LoanStatus, RepaymentFrequency } from "@/types/loans.types";
import DeleteConfirmationModal from "@/components/inventory/DeleteConfirmationModal";
import { AlertTriangle, CheckCircle, DollarSign, History, Plus, TrendingDown } from "lucide-react";
import { formatNumber } from "@/utils/formatNumber";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

const Loans = () => {
  const { t } = useTranslation('pages');
  const { t: tc } = useTranslation('common');
  const store = useContext(StoreContext);
  const { user } = useAuth();
  const { isOnline } = useOfflineStatus();

  const frequencyOptions: { value: RepaymentFrequency; label: string }[] = [
    { value: "everyday", label: tc('everyday') },
    { value: "every_2_days", label: tc('every2Days') },
    { value: "every_3_days", label: tc('every3Days') },
    { value: "every_week", label: tc('everyWeek') },
    { value: "every_2_weeks", label: tc('every2Weeks') },
    { value: "monthly", label: tc('monthly') },
    { value: "every_2_months", label: tc('every2Months') },
    { value: "every_3_months", label: tc('every3Months') },
    { value: "yearly", label: tc('yearly') },
  ];

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRepayOpen, setIsRepayOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    borrower_name: "",
    principal: "",
    interest_percent: "", // user enters percent
    interest_amount: "", // optional direct amount entry
    interest_mode: "percent" as "percent" | "amount",
    start_date: format(new Date(), "yyyy-MM-dd"),
    due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    repayment_frequency: "every_week" as RepaymentFrequency,
    purpose: "",
  });

  const [repaymentForm, setRepaymentForm] = useState({
    amount: "",
    paid_at: format(new Date(), "yyyy-MM-dd"),
    note: "",
  });

  const { data: loans } = useLoans(store?.id);
  const { data: summary } = useLoansSummary(store?.id);
  const { data: repaymentsByStore } = useRepaymentsByStore(store?.id);
  const createLoan = useCreateLoan();
  const addRepayment = useAddRepayment();
  const deleteLoan = useDeleteLoan();

  const totals = {
    totalLoans: summary?.total_loans || 0,
    activeLoans: summary?.active_loans || 0,
    completedLoans: summary?.completed_loans || 0,
    totalPrincipal: summary?.total_principal || 0,
    totalRepaid: summary?.total_repaid || 0,
    outstanding: summary?.outstanding_balance || 0,
  };

  const computeTotalPayable = (loan: Loan) => {
    const p = Number(loan.principal || 0);
    const rateDecimal = Number(loan.interest_rate || 0);
    return p + p * rateDecimal;
  };

  const totalRepaidMap = useMemo(() => {
    const map = new Map<string, number>();
    (repaymentsByStore || []).forEach((r: any) => {
      map.set(r.loan_id, (map.get(r.loan_id) || 0) + Number(r.amount || 0));
    });
    return map;
  }, [repaymentsByStore]);

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id || !user?.id) return;

    const principalNum = Number(createForm.principal || 0);
    const interestPct = Number(createForm.interest_percent || 0);
    const interestAmt = Number(createForm.interest_amount || 0);
    const rateDecimal = createForm.interest_mode === "percent"
      ? (interestPct / 100)
      : (principalNum > 0 ? (interestAmt / principalNum) : 0);

    const loanData = {
      store_id: store.id,
      borrower_name: createForm.borrower_name.trim(),
      principal: principalNum,
      interest_rate: rateDecimal,
      start_date: createForm.start_date,
      due_date: createForm.due_date,
      repayment_frequency: createForm.repayment_frequency,
      purpose: createForm.purpose?.trim() || undefined,
      user_id: user.id,
      status: 'active' as LoanStatus,
    };

    // Offline handling is managed by useOfflineMutation in the hook
    // We just call mutateAsync and let it handle queueing or online submission

    console.log("🌐 ONLINE: Creating loan with await");
    try {
      await createLoan.mutateAsync(loanData);

      setIsCreateOpen(false);
      setCreateForm({
        borrower_name: "",
        principal: "",
        interest_percent: "",
        interest_amount: "",
        interest_mode: "percent",
        start_date: format(new Date(), "yyyy-MM-dd"),
        due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        repayment_frequency: "every_week",
        purpose: "",
      });
      toast.success(tc('loanCreated'));
      console.log("✅ ONLINE: Loan created successfully");
    } catch (err: any) {
      console.error("❌ Error creating loan:", err);
      toast.error(err?.message || tc('failedToCreateLoan'));
    }
  };

  const handleAddRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoan) return;

    const repaymentData = {
      loan_id: activeLoan.id,
      amount: Number(repaymentForm.amount || 0),
      paid_at: repaymentForm.paid_at,
      note: repaymentForm.note?.trim() || undefined,
    };

    // Offline handling is managed by useOfflineMutation in the hook

    console.log("🌐 ONLINE: Adding repayment with await");
    try {
      await addRepayment.mutateAsync(repaymentData);

      setIsRepayOpen(false);
      setRepaymentForm({ amount: "", paid_at: format(new Date(), "yyyy-MM-dd"), note: "" });
      toast.success(tc('repaymentAdded'));
      console.log("✅ ONLINE: Repayment added successfully");
    } catch (err: any) {
      console.error("❌ Error adding repayment:", err);
      toast.error(err?.message || tc('failedToCreateLoan'));
    }
  };

  if (!store) {
    return (
      <NoStoreMessage
        title={t('loans.loansManagement')}
        description={t('loans.loansManagementDesc')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#18191A]">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('loans.title')}</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4 mr-2" /> {t('loans.newLoan')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('loans.createLoan')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateLoan} className="space-y-4">
                <div>
                  <Label>{t('loans.borrowerLender')}</Label>
                  <Input value={createForm.borrower_name} onChange={e => setCreateForm(f => ({ ...f, borrower_name: e.target.value }))} placeholder="e.g. Access Bank" />
                </div>
                <div className="space-y-3">
                  <div>
                    <Label>{t('loans.principal')}</Label>
                    <Input type="number" inputMode="decimal" value={createForm.principal} onChange={e => setCreateForm(f => ({ ...f, principal: e.target.value }))} placeholder="0" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>{t('loans.interestLabel')}</Label>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{t('loans.enterBy')}</span>
                        <Select value={createForm.interest_mode} onValueChange={(v: any) => setCreateForm(f => ({ ...f, interest_mode: v }))}>
                          <SelectTrigger className="h-7 w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percent">{tc('percentLabel')}</SelectItem>
                            <SelectItem value="amount">{tc('amountLabel')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {createForm.interest_mode === "percent" ? (
                      <div className="mt-1">
                        <div className="relative">
                          <Input type="number" inputMode="decimal" step="0.1" value={createForm.interest_percent} onChange={e => setCreateForm(f => ({ ...f, interest_percent: e.target.value }))} placeholder="0" />
                          <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">%</span>
                        </div>
                        <EquivalentFromPercent principal={createForm.principal} percent={createForm.interest_percent} t={t} />
                      </div>
                    ) : (
                      <div className="mt-1">
                        <div className="relative">
                          <Input type="number" inputMode="decimal" value={createForm.interest_amount} onChange={e => setCreateForm(f => ({ ...f, interest_amount: e.target.value }))} placeholder="0" />
                          <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">₦</span>
                        </div>
                        <EquivalentFromAmount principal={createForm.principal} amount={createForm.interest_amount} t={t} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t('startDate')}</Label>
                    <Input type="date" value={createForm.start_date} onChange={e => setCreateForm(f => ({ ...f, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <Label>{t('loans.dueDate')}</Label>
                    <Input type="date" value={createForm.due_date} onChange={e => setCreateForm(f => ({ ...f, due_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>{t('loans.repaymentFrequency')}</Label>
                  <Select value={createForm.repayment_frequency} onValueChange={(v: RepaymentFrequency) => setCreateForm(f => ({ ...f, repayment_frequency: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('loans.purpose')}</Label>
                  <Input value={createForm.purpose} onChange={e => setCreateForm(f => ({ ...f, purpose: e.target.value }))} placeholder={t('loans.purposePlaceholder')} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white">{t('create')}</Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>{t('cancel')}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between gap-2 text-sm md:text-base">
                <span className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-blue-600" /> {t('loans.totalPayable')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{new Intl.NumberFormat().format(totals.totalPrincipal)}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('loans.principalPlusInterest')}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between gap-2 text-sm md:text-base">
                <span className="flex items-center gap-2"><TrendingDown className="h-4 w-4 text-green-600" /> {t('loans.totalRepaid')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₦{new Intl.NumberFormat().format(totals.totalRepaid)}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('loans.acrossAllLoans')}</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between gap-2 text-sm md:text-base">
                <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /> {t('loans.outstanding')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₦{new Intl.NumberFormat().format(totals.outstanding)}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('loans.amountLeftToRepay')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Section heading */}
        <div className="mb-3 md:mb-4">
          <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">{t('loans.allLoans')}</h2>
        </div>

        {/* Loans list */}
        <div className="grid gap-4">
          {(loans || []).map(loan => {
            const totalPayable = computeTotalPayable(loan);
            const totalRepaid = totalRepaidMap.get(loan.id) || 0;
            const outstanding = Math.max(0, totalPayable - totalRepaid);
            const progress = totalPayable > 0 ? Math.min(100, Math.round((totalRepaid / totalPayable) * 100)) : 0;
            const statusColor = loan.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' : loan.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
            return (
              <Card key={loan.id} className="relative overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">{loan.borrower_name}</span>
                      <Badge className={statusColor}>{loan.status}</Badge>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t('loans.due')}: {format(new Date(loan.due_date), 'dd MMM yyyy')}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">{t('loans.principal')}</div>
                      <div className="font-semibold">₦{new Intl.NumberFormat().format(Number(loan.principal || 0))}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">{t('loans.interestLabel')}</div>
                      <div className="font-semibold">{new Intl.NumberFormat().format(Number(loan.interest_rate || 0) * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">{t('loans.totalRepayment')}</div>
                      <div className="font-semibold">₦{new Intl.NumberFormat().format(totalPayable)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">{t('loans.repaid')}</div>
                      <div className="font-semibold text-green-600">₦{new Intl.NumberFormat().format(totalRepaid)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">{t('loans.outstanding')}</div>
                      <div className="font-semibold text-red-600">₦{new Intl.NumberFormat().format(outstanding)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">{tc('repaymentFrequency')}</div>
                      <div className="font-semibold capitalize">{(loan.repayment_frequency || '').replace('_', ' ')}</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>{tc('progress')}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => { setActiveLoan(loan); setIsRepayOpen(true); }}>{t('loans.addRepayment')}</Button>
                    <Button variant="outline" onClick={() => { setActiveLoan(loan); setIsHistoryOpen(true); }}>
                      <History className="h-4 w-4 mr-2" /> {t('loans.history')}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        setActiveLoan(loan);
                        setIsDeleteOpen(true);
                      }}
                    >
                      {tc('delete')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add repayment modal */}
        <Dialog open={isRepayOpen} onOpenChange={setIsRepayOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('loans.addRepayment')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRepayment} className="space-y-4">
              <div>
                <Label>{tc('amountNaira')}</Label>
                <Input type="number" inputMode="decimal" value={repaymentForm.amount} onChange={e => setRepaymentForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{t('loans.paidAt')}</Label>
                  <Input type="date" value={repaymentForm.paid_at} onChange={e => setRepaymentForm(f => ({ ...f, paid_at: e.target.value }))} />
                </div>
                <div>
                  <Label>{t('loans.noteOptional')}</Label>
                  <Input value={repaymentForm.note} onChange={e => setRepaymentForm(f => ({ ...f, note: e.target.value }))} placeholder={t('loans.notePlaceholder')} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white">{t('save')}</Button>
                <Button type="button" variant="outline" onClick={() => setIsRepayOpen(false)}>{t('cancel')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete loan modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={async () => {
            if (!activeLoan) return;
            try {
              await deleteLoan.mutateAsync({ loanId: activeLoan.id, storeId: store?.id || "" });
              toast.success(t('loanDeleted'));
            } catch (err: any) {
              toast.error(err?.message || tc('failedToCreateLoan'));
            } finally {
              setIsDeleteOpen(false);
              setActiveLoan(null);
            }
          }}
          productName={activeLoan?.borrower_name || "this loan"}
        />

        {/* History modal */}
        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('loans.repaymentHistory')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {activeLoan ? (
                <LoanHistory loanId={activeLoan.id} t={t} />
              ) : (
                <div className="text-sm text-gray-500">{t('noLoanSelected')}</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

const EquivalentFromPercent = ({ principal, percent, t }: { principal: string; percent: string; t: any }) => {
  const p = Number(principal || 0);
  const pct = Number(percent || 0);
  const amount = p > 0 && pct > 0 ? (p * pct) / 100 : 0;
  return (
    <div className="mt-1 text-xs text-gray-500">{t('equivalentInterestAmount')}: ₦{amount.toLocaleString()}</div>
  );
};

const EquivalentFromAmount = ({ principal, amount, t }: { principal: string; amount: string; t: any }) => {
  const p = Number(principal || 0);
  const a = Number(amount || 0);
  const pct = p > 0 && a > 0 ? (a / p) * 100 : 0;
  return (
    <div className="mt-1 text-xs text-gray-500">{t('equivalentInterestPercent')}: {pct.toFixed(2)}%</div>
  );
};

const LoanHistory = ({ loanId, t }: { loanId: string; t: any }) => {
  const { data: repayments } = useRepayments(loanId);
  const totalRepaid = (repayments || []).reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0);
  if (!repayments?.length) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <History className="h-6 w-6 text-gray-400" />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{t('noRepaymentsYet')}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('repaymentsWillAppear')}</div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-[#18191A]">
        <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{t('totalRepaid')}</div>
        <div className="text-base md:text-lg font-semibold text-green-600">₦{new Intl.NumberFormat().format(totalRepaid)}</div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        {repayments.map((r: any) => (
          <div key={r.id} className="p-3 md:p-4 flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">₦{new Intl.NumberFormat().format(Number(r.amount || 0))}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(r.paid_at), 'dd MMM yyyy')}</div>
            </div>
            {r.note && (
              <div className="ml-3">
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">{r.note}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loans;
