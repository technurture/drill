import React, { useState, useContext, useEffect } from "react";
import { StoreContext } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown, Calendar, FileText, X, Trash2, Filter } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useFinancialRecords, useAddFinancialRecord, useDeleteFinancialRecord } from "@/integrations/supabase/hooks/finance";
import { toast } from "sonner";
import NoStoreMessage from "@/components/NoStoreMessage";
import { formatNumber } from "@/utils/formatNumber";
import { FinancialRecord } from "@/integrations/supabase/hooks/finance";
import { useTranslation } from "react-i18next";

const Finance = () => {
  const { t } = useTranslation('pages');
  const { t: tc } = useTranslation('common');
  const selectedStore = useContext(StoreContext);
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FinancialRecord | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Form state
  const [formData, setFormData] = useState({
    type: "income",
    reason: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd")
  });

  // Fetch financial records
  const { data: financialRecords, isLoading, error, refetch } = useFinancialRecords(selectedStore?.id);
  const addFinancialRecord = useAddFinancialRecord();
  const deleteFinancialRecord = useDeleteFinancialRecord();

  // Show NoStoreMessage if no store is selected
  if (!selectedStore) {
    return (
      <NoStoreMessage 
        title={t('finance.financeManagement')}
        description={t('finance.financeManagementDesc')}
      />
    );
  }

  // Calculate totals
  const totalIncome = financialRecords?.filter(record => record.type === 'income')?.reduce((sum, record) => sum + parseFloat(record.amount), 0) || 0;
  const totalExpenses = financialRecords?.filter(record => record.type === 'expense')?.reduce((sum, record) => sum + parseFloat(record.amount), 0) || 0;
  const netIncome = totalIncome - totalExpenses;

  // Filter records
  const filteredRecords = financialRecords?.filter(record => {
    const typeMatch = filterType === "all" || record.type === filterType;
    const dateMatch = !dateRange.from || !dateRange.to || 
      (record.date >= dateRange.from && record.date <= dateRange.to);
    return typeMatch && dateMatch;
  }) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Finance - Submit clicked");
    console.log("Finance - Store:", selectedStore);
    console.log("Finance - User:", user);
    console.log("Finance - Form data:", formData);
    
    if (!selectedStore?.id) {
      toast.error("No store selected");
      return;
    }

    if (!user?.id) {
      toast.error("User not logged in");
      return;
    }

    if (!formData.reason.trim() || !formData.amount || !formData.date) {
      toast.error("Please fill in all fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    const recordData = {
      store_id: selectedStore.id,
      user_id: user.id,
      type: formData.type as 'income' | 'expense',
      reason: formData.reason.trim(),
      amount: amount,
      date: formData.date
    };

  const handleDelete = async (recordId: string) => {
    if (!selectedStore?.id) {
      toast.error("No store selected");
      return;
    }

    try {
      await deleteFinancialRecord.mutateAsync(recordId);
      toast.success("Financial record deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting financial record:", error);
      toast.error("Failed to delete financial record");
    }
  };

    console.log("Finance - Record data to insert:", recordData);

    try {
      const result = await addFinancialRecord.mutateAsync(recordData);
      console.log("Finance - Record added successfully:", result);

      toast.success(`${formData.type === 'income' ? 'Income' : 'Expense'} added successfully`);
      setIsAddModalOpen(false);
      setFormData({
        type: "income",
        reason: "",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd")
      });
      refetch();
    } catch (error) {
      console.error("Finance - Error adding record:", error);
      toast.error("Failed to add financial record");
    }
  };

  const handleDelete = async (recordId: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteFinancialRecord.mutateAsync(recordId);
        toast.success("Record deleted successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to delete record");
        console.error(error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading financial records</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#18191A]">
      <div className="max-w-4xl mx-auto px-2 flex flex-col gap-4 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Finance Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('finance.trackIncomeExpenses')} {selectedStore?.store_name || "your store"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden md:inline">Filters</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('finance.filterFinancialRecords')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type-filter">Type</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{tc('allRecords')}</SelectItem>
                        <SelectItem value="income">{tc('incomeOnly')}</SelectItem>
                        <SelectItem value="expense">{tc('expensesOnly')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="date-from">Date From</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date-to">Date To</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFilterType("all");
                        setDateRange({ from: "", to: "" });
                      }}
                      className="flex-1"
                    >
                      Clear Filters
                    </Button>
                    <Button 
                      onClick={() => setIsFilterModalOpen(false)}
                      className="flex-1"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={() => setIsAddModalOpen(true)} className="hidden md:inline-flex bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </div>
        </div>

        {/* Summary Cards - 2 per row on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-white dark:bg-[#18191A] border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₦{new Intl.NumberFormat().format(totalIncome)}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-[#18191A] border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₦{new Intl.NumberFormat().format(totalExpenses)}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-[#18191A] border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <span>Net Income</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₦{new Intl.NumberFormat().format(netIncome)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Record Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('finance.addFinancialRecord')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason/Description</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="e.g., Rent payment, Equipment purchase"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={addFinancialRecord.isPending}>
                  {addFinancialRecord.isPending ? "Adding..." : "Add Record"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Financial Records Table */}
        <Card className="bg-white dark:bg-[#18191A] border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Financial Records</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('finance.noFinancialRecordsFound')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {filterType !== "all" || dateRange.from || dateRange.to 
                    ? "Try adjusting your filters" 
                    : "Add your first income or expense record to get started"}
                </p>
                {filterType === "all" && !dateRange.from && !dateRange.to && (
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Record
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Mobile View */}
                <div className="lg:hidden space-y-2">
                  {filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => {
                        setSelectedRecord(record);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {format(parseISO(record.date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {record.sale_id ? "Sales of products" : record.reason}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {record.sale?.items && record.sale.items.length > 0 
                            ? `${record.sale.items.length} item(s) sold`
                            : record.sale_id 
                            ? "Auto-generated from sale"
                            : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={record.type === 'income' ? 'default' : 'destructive'} className="mb-1">
                          {record.type === 'income' ? 'Income' : 'Expense'}
                        </Badge>
                        <div className={`font-bold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          ₦{parseFloat(record.amount).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {format(parseISO(record.date), "MMM dd, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={record.type === 'income' ? 'default' : 'destructive'}>
                              {record.type === 'income' ? 'Income' : 'Expense'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {record.sale_id ? (
                              <div>
                                <span>Sales of products</span>
                                {record.sale?.items && record.sale.items.length > 0 ? (
                                  <div className="text-xs text-gray-500 block mt-1">
                                    {record.sale.items.map((item, index) => (
                                      <div key={item.id} className="flex justify-between">
                                        <span>{item.product?.name || 'Unknown Product'}</span>
                                        <span className="ml-2">({item.quantity} × ₦{item.unit_price.toLocaleString()})</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500 block">
                                    (Auto-generated from sale)
                                  </span>
                                )}
                              </div>
                            ) : (
                              record.reason
                            )}
                          </TableCell>
                          <TableCell className={`font-medium ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            ₦{parseFloat(record.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                              disabled={deleteFinancialRecord.isPending}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Add Record Button for Mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('finance.addFinancialRecord')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason/Description</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="e.g., Rent payment, Equipment purchase"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={addFinancialRecord.isPending}>
                  {addFinancialRecord.isPending ? "Adding..." : "Add Record"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Financial Details Modal for Mobile */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Financial Record Details</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDetailsModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              {/* Record Type and Amount */}
              <div className="flex items-center justify-between">
                <Badge variant={selectedRecord.type === 'income' ? 'default' : 'destructive'} className="text-sm">
                  {selectedRecord.type === 'income' ? 'Income' : 'Expense'}
                </Badge>
                <div className={`text-2xl font-bold ${selectedRecord.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  ₦{parseFloat(selectedRecord.amount).toLocaleString()}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Date</Label>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {format(parseISO(selectedRecord.date), "EEEE, MMMM dd, yyyy")}
                </div>
              </div>

              {/* Reason/Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">Description</Label>
                <div className="text-gray-900 dark:text-white">
                  {selectedRecord.sale_id ? (
                    <div>
                      <div className="font-medium">Sales of products</div>
                      {selectedRecord.sale?.items && selectedRecord.sale.items.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          <div className="text-sm text-gray-500">Items sold:</div>
                          {selectedRecord.sale.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <div>
                                <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                                <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">₦{item.unit_price.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">per unit</div>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="font-medium">Total:</span>
                            <span className="font-bold">₦{selectedRecord.sale.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 mt-1">(Auto-generated from sale)</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-900 dark:text-white">{selectedRecord.reason}</div>
                  )}
                </div>
              </div>

              

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDelete(selectedRecord.id);
                    setIsDetailsModalOpen(false);
                  }}
                  disabled={deleteFinancialRecord.isPending}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteFinancialRecord.isPending ? "Deleting..." : "Delete Record"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Finance; 