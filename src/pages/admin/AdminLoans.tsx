import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/supabase';
import { downloadCSV, formatCurrencyForCSV } from '@/utils/exportUtils';
import { format } from 'date-fns';

interface StoreRow {
  store_id: string;
  store_name: string;
  owner_email?: string;
  total_loans_count: number;
  total_payable: number;
  total_repaid: number;
  outstanding: number;
}

const AdminLoans: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyStore, setHistoryStore] = useState<StoreRow | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ['admin-loans'],
    queryFn: async (): Promise<StoreRow[]> => {
      // Fetch users for owner emails
      const { data: users } = await supabase
        .from('users')
        .select('id, email');
      const userMap = new Map((users || []).map(u => [u.id, u.email]));

      // Fetch loans
      const { data: loans, error: loansError } = await supabase
        .from('loans')
        .select('id, store_id, principal, interest_rate');
      if (loansError) throw loansError;

      // Get distinct store_ids from loans
      const storeIds = Array.from(new Set((loans || []).map((l: any) => l.store_id))).filter(Boolean);

      // Fetch stores with * to avoid column mismatch errors across environments
      let stores: any[] = [];
      if (storeIds.length > 0) {
        const { data: storesAny, error: storesAnyErr } = await supabase
          .from('stores')
          .select('*')
          .in('id', storeIds);
        if (storesAnyErr) throw storesAnyErr;
        stores = storesAny || [];
      }

      // Fetch repayments
      const { data: repayments } = await supabase
        .from('loan_repayments')
        .select('loan_id, amount');

      const repaidMap = new Map<string, number>();
      (repayments || []).forEach(r => {
        repaidMap.set(r.loan_id, (repaidMap.get(r.loan_id) || 0) + Number(r.amount || 0));
      });

      // Aggregate per store
      const storeAgg = new Map<string, StoreRow>();
      (stores || []).forEach((s: any) => {
        const storeName = s.name || s.store_name || 'Unnamed Store';
        storeAgg.set(s.id, {
          store_id: s.id,
          store_name: storeName,
          owner_email: userMap.get(s.owner_id) || undefined,
          total_loans_count: 0,
          total_payable: 0,
          total_repaid: 0,
          outstanding: 0,
        });
      });

      (loans || []).forEach((l: any) => {
        const principal = Number(l.principal || 0);
        const rate = Number(l.interest_rate || 0); // decimal
        const payable = principal + principal * rate;
        const repaid = 0 + [...(repaidMap.entries())]
          .filter(([loanId]) => loanId === l.id)
          .reduce((sum, [, amt]) => sum + amt, 0);
        const bucket = storeAgg.get(l.store_id);
        if (bucket) {
          bucket.total_loans_count += 1;
          bucket.total_payable += payable;
          bucket.total_repaid += repaid;
          bucket.outstanding = Math.max(0, bucket.total_payable - bucket.total_repaid);
        }
      });

      return Array.from(storeAgg.values());
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows || [];
    return (rows || []).filter(r => (r.store_name || '').toLowerCase().includes(q) || (r.owner_email || '').toLowerCase().includes(q));
  }, [rows, search]);

  const overview = useMemo(() => {
    const list = filtered || [];
    const totalPayable = list.reduce((s, r) => s + Number(r.total_payable || 0), 0);
    const totalRepaid = list.reduce((s, r) => s + Number(r.total_repaid || 0), 0);
    return { totalPayable, totalRepaid };
  }, [filtered]);

  const totalItems = filtered?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = (filtered || []).slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportStoresSummaryCSV = () => {
    // Build rows as objects; downloadCSV infers headers from object keys
    const rowsForCsv = (filtered || []).map(r => ({
      'store name': r.store_name,
      'user email': r.owner_email || '',
      'total loan collected': formatCurrencyForCSV(r.total_payable),
      'total loan repaid': formatCurrencyForCSV(r.total_repaid),
      'current loan to repay': formatCurrencyForCSV(Math.max(0, (r.total_payable || 0) - (r.total_repaid || 0))),
    }));
    downloadCSV(rowsForCsv, 'admin-loans-overview');
  };

  const exportLoansCSV = async () => {
    // Build per-loan export: store name, loan id, principal, interest %, total payable, total repaid, outstanding, start_date, due_date
    // Fetch all loans and repayments to build export accurately
    const { data: loans, error: loansErr } = await supabase
      .from('loans')
      .select('id, store_id, principal, interest_rate, start_date, due_date');
    if (loansErr) return;

    const loanIds = (loans || []).map((l: any) => l.id);
    const { data: reps } = loanIds.length > 0
      ? await supabase.from('loan_repayments').select('loan_id, amount').in('loan_id', loanIds)
      : { data: [] as any[] } as any;
    const repaidMap = new Map<string, number>();
    (reps || []).forEach((r: any) => repaidMap.set(r.loan_id, (repaidMap.get(r.loan_id) || 0) + Number(r.amount || 0)));

    const storeIds = Array.from(new Set((loans || []).map((l: any) => l.store_id))).filter(Boolean);
    const { data: stores } = storeIds.length > 0
      ? await supabase.from('stores').select('*').in('id', storeIds)
      : { data: [] as any[] } as any;
    const storeNameMap = new Map<string, string>();
    (stores || []).forEach((s: any) => storeNameMap.set(s.id, s.name || s.store_name || 'Unnamed Store'));

    const headers = ['Store Name', 'Loan ID', 'Principal', 'Interest (%)', 'Total Payable', 'Total Repaid', 'Outstanding', 'Start Date', 'Due Date'];
    const rowsData = (loans || []).map((l: any) => {
      const principal = Number(l.principal || 0);
      const rate = Number(l.interest_rate || 0);
      const totalPayable = principal + principal * rate;
      const totalRepaid = repaidMap.get(l.id) || 0;
      const outstanding = Math.max(0, totalPayable - totalRepaid);
      return {
        'Store Name': storeNameMap.get(l.store_id) || '',
        'Loan ID': l.id,
        'Principal': formatCurrencyForCSV(principal),
        'Interest (%)': (rate * 100).toFixed(2),
        'Total Payable': formatCurrencyForCSV(totalPayable),
        'Total Repaid': formatCurrencyForCSV(totalRepaid),
        'Outstanding': formatCurrencyForCSV(outstanding),
        'Start Date': l.start_date || '',
        'Due Date': l.due_date || ''
      };
    });
    downloadCSV(rowsData, 'admin-loans-detail');
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Loans Overview</h1>
        <div className="flex gap-2">
          <input
            className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A] text-sm"
            placeholder="Search stores or owner email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={exportStoresSummaryCSV}>Export CSV</Button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Loans (Payable)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{overview.totalPayable.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{overview.totalRepaid.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(pageRows || []).map((s) => (
          <Card key={s.store_id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>{s.store_name}</span>
                {s.owner_email && <span className="text-xs text-gray-500">{s.owner_email}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Loans Count</div>
                  <div className="font-semibold">{s.total_loans_count}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Total Payable</div>
                  <div className="font-semibold">₦{s.total_payable.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Total Repaid</div>
                  <div className="font-semibold">₦{s.total_repaid.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">Outstanding</div>
                  <div className="font-semibold">₦{s.outstanding.toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={() => { setHistoryStore(s); setHistoryOpen(true); }}>View History</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages} • Showing {pageRows.length} of {totalItems}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={currentPage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="outline" disabled={currentPage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
      )}

      <AdminLoanHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} store={historyStore} />
    </div>
  );
};

const AdminLoanHistoryDialog = ({ open, onOpenChange, store }: { open: boolean; onOpenChange: (v: boolean) => void; store: StoreRow | null }) => {
  const storeId = store?.store_id || '';

  const { data: loans } = useQuery({
    queryKey: ['admin-store-loans', storeId],
    queryFn: async () => {
      if (!storeId) return [] as any[];
      const { data, error } = await supabase
        .from('loans')
        .select('id, principal, interest_rate, start_date, due_date')
        .eq('store_id', storeId)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!storeId,
  });

  const { data: repayments } = useQuery({
    queryKey: ['admin-store-loan-repayments', storeId],
    queryFn: async () => {
      if (!storeId) return [] as any[];
      // fetch repayments for loans of this store via inner join
      const { data, error } = await supabase
        .from('loan_repayments')
        .select('id, loan_id, amount, paid_at, note, loans!inner(store_id)')
        .eq('loans.store_id', storeId)
        .order('paid_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!storeId,
  });

  const repaymentsByLoan = useMemo(() => {
    const map = new Map<string, any[]>();
    (repayments || []).forEach((r: any) => {
      const arr = map.get(r.loan_id) || [];
      arr.push(r);
      map.set(r.loan_id, arr);
    });
    return map;
  }, [repayments]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Loan History{store ? ` — ${store.store_name}` : ''}</DialogTitle>
        </DialogHeader>
        {!store ? (
          <div className="text-sm text-gray-500">No store selected.</div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {(loans || []).length === 0 ? (
              <div className="text-sm text-gray-500">No loans found for this store.</div>
            ) : (
              (loans || []).map((l: any) => {
                const principal = Number(l.principal || 0);
                const rate = Number(l.interest_rate || 0);
                const totalPayable = principal + principal * rate;
                const loanRepayments = repaymentsByLoan.get(l.id) || [];
                const totalRepaid = loanRepayments.reduce((s, x) => s + Number(x.amount || 0), 0);
                return (
                  <Card key={l.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Started {l.start_date ? format(new Date(l.start_date), 'dd MMM yyyy') : '-'} • Due {l.due_date ? format(new Date(l.due_date), 'dd MMM yyyy') : '-'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500">Principal</div>
                          <div className="font-semibold">₦{principal.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Interest</div>
                          <div className="font-semibold">{(rate * 100)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Total Payable</div>
                          <div className="font-semibold">₦{totalPayable.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Total Repaid</div>
                          <div className="font-semibold">₦{totalRepaid.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-2">Repayments</div>
                        {loanRepayments.length === 0 ? (
                          <div className="text-xs text-gray-500">No repayments yet.</div>
                        ) : (
                          <div className="space-y-2">
                            {loanRepayments.map((r: any) => (
                              <div key={r.id} className="flex items-center justify-between text-xs border-b border-gray-100 dark:border-gray-800 pb-2">
                                <div>
                                  <div className="text-gray-700 dark:text-gray-300">₦{Number(r.amount).toLocaleString()}</div>
                                  <div className="text-[11px] text-gray-500">{r.paid_at ? format(new Date(r.paid_at), 'dd MMM yyyy') : ''}</div>
                                </div>
                                {r.note && <div className="text-[11px] text-gray-500">{r.note}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminLoans;
