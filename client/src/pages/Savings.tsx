import React, { useState, useContext, useMemo } from "react";
import { StoreContext } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  PiggyBank,
  TrendingUp,
  Calendar,
  Target,
  Users,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  Eye,
  AlertTriangle,
  Filter
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  useSavingsPlans,
  useCreateSavingsPlan,
  useAddContribution,
  useDeleteSavingsPlan,
  useSavingsSummary,
  useWithdrawSavings,
  useWithdrawPartialSavings,
  useSavingsWithdrawals
} from "@/integrations/supabase/hooks/savings";
import {
  SAVINGS_DURATION_OPTIONS,
  SAVINGS_STATUS_OPTIONS,
  type CreateSavingsPlanData,
  type AddContributionData
} from "@/types/savings.types";
import { toast } from "sonner";
import NoStoreMessage from "@/components/NoStoreMessage";
import WithdrawSavingsModal from "@/components/ui/modals/WithdrawSavingsModal";
import { useTranslation } from "react-i18next";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

const Savings = () => {
  const { t } = useTranslation('pages');
  const { t: tc } = useTranslation('common');
  const selectedStore = useContext(StoreContext);
  const { user } = useAuth();
  const { isOnline } = useOfflineStatus();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPlanForDetails, setSelectedPlanForDetails] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [contributionWarning, setContributionWarning] = useState<string | null>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedPlanForWithdrawal, setSelectedPlanForWithdrawal] = useState<any>(null);
  const [lastWithdrawal, setLastWithdrawal] = useState<{ planId: string; amount: number; at: string } | null>(null);

  // Form state for creating savings plan
  const [createFormData, setCreateFormData] = useState<{
    title: string;
    start_date: string;
    end_date: string;
    contributing_to: string;
    savings_duration: "weekly" | "monthly" | "yearly";
    target_amount: string;
  }>({
    title: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // 30 days from now
    contributing_to: "",
    savings_duration: "weekly",
    target_amount: ""
  });

  // Form state for adding contribution
  const [contributionData, setContributionData] = useState<{
    savings_plan_id: string;
    amount: string;
    contribution_date: string;
  }>({
    savings_plan_id: "",
    amount: "",
    contribution_date: format(new Date(), "yyyy-MM-dd")
  });

  // Fetch data
  const { data: savingsPlans, isLoading, error, refetch } = useSavingsPlans(selectedStore?.id);
  const { data: summary } = useSavingsSummary(selectedStore?.id);
  const createSavingsPlan = useCreateSavingsPlan();
  const addContribution = useAddContribution();
  const deleteSavingsPlan = useDeleteSavingsPlan();
  const withdrawSavings = useWithdrawSavings();
  const withdrawPartial = useWithdrawPartialSavings();
  const { data: withdrawals } = useSavingsWithdrawals(selectedPlanForDetails?.id);

  // Calculate total withdrawals for the store from savings_withdrawals table
  const totalWithdrawals = useMemo(() => {
    if (!savingsPlans) return 0;
    return savingsPlans.reduce((sum, plan: any) => {
      const w = (plan.withdrawals || []) as Array<{ amount_withdrawn: number }>;
      const planTotal = w.reduce((s, r) => s + Number(r.amount_withdrawn || 0), 0);
      return sum + planTotal;
    }, 0);
  }, [savingsPlans]);

  // Show NoStoreMessage if no store is selected
  if (!selectedStore) {
    return (
      <NoStoreMessage
        title={t('savings.savingsManagement')}
        description={t('savings.savingsManagementDesc')}
      />
    );
  }

  // Debug logging
  console.log("Savings - Store ID:", selectedStore?.id);
  console.log("Savings - User ID:", user?.id);
  console.log("Savings - Plans:", savingsPlans);
  console.log("Savings - Plans with contributions:", savingsPlans?.map(plan => ({
    id: plan.id,
    title: plan.title,
    current_amount: plan.current_amount,
    target_amount: plan.target_amount,
    status: plan.status,
    contributions_count: plan.contributions?.length || 0,
    contributions: plan.contributions
  })));
  console.log("Savings - Summary:", summary);
  console.log("Savings - Loading:", isLoading);
  console.log("Savings - Error:", error);

  // Filter plans based on status
  const filteredPlans = savingsPlans?.filter(plan => {
    if (filterStatus === "all") return true;

    // Calculate actual status based on contributions and database status
    let actualStatus;
    if (plan.status === 'withdrawn') {
      actualStatus = 'withdrawn';
    } else {
      const totalContributions = plan.contributions?.reduce((sum, contribution) =>
        sum + parseFloat(contribution.amount), 0) || 0;

      if (totalContributions === 0) {
        actualStatus = 'just_started';
      } else if (totalContributions >= parseFloat(plan.target_amount)) {
        actualStatus = 'completed';
      } else {
        actualStatus = 'in_progress';
      }
    }

    return actualStatus === filterStatus;
  }) || [];

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStore?.id || !user?.id) {
      toast.error("No store selected or user not logged in");
      return;
    }

    if (!createFormData.title.trim() || !createFormData.contributing_to.trim() || parseFloat(createFormData.target_amount) <= 0) {
      toast.error("Please fill in all fields correctly");
      return;
    }

    if (new Date(createFormData.end_date) <= new Date(createFormData.start_date)) {
      toast.error("End date must be after start date");
      return;
    }

    const planData = {
      ...createFormData,
      target_amount: parseFloat(createFormData.target_amount),
      store_id: selectedStore.id,
      user_id: user.id,
      current_amount: "0",
      status: 'just_started'
    };

    if (!isOnline) {
      console.log('📴 Offline: Queueing savings plan creation immediately without awaiting');

      createSavingsPlan.mutate(planData, {
        onError: (error: any) => {
          setIsCreateModalOpen(true);
          toast.error(tc('failedToSaveOffline') + ': ' + (error?.message || tc('pleaseTryAgain')));
        }
      });

      // Close immediately after queueing starts
      toast.success(tc('savedLocallyWillSync'));
      setIsCreateModalOpen(false);
      setCreateFormData({
        title: "",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        contributing_to: "",
        savings_duration: "weekly",
        target_amount: ""
      });
      return;
    }

    try {
      await createSavingsPlan.mutateAsync(planData);

      toast.success("Savings plan created successfully!");
      setIsCreateModalOpen(false);
      setCreateFormData({
        title: "",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        contributing_to: "",
        savings_duration: "weekly",
        target_amount: ""
      });
      refetch();
    } catch (error) {
      toast.error("Failed to create savings plan");
      console.error(error);
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Adding contribution:", contributionData);

    if (!selectedStore?.id || !user?.id) {
      toast.error("No store selected or user not logged in");
      return;
    }

    if (parseFloat(contributionData.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    // Find the selected plan to check its status and current amount
    const selectedPlanData = savingsPlans?.find(plan => plan.id === contributionData.savings_plan_id);

    if (!selectedPlanData) {
      toast.error("Selected savings plan not found");
      return;
    }

    // Check if plan is withdrawn
    if (selectedPlanData.status === 'withdrawn') {
      toast.error("Cannot contribute to a withdrawn savings plan");
      return;
    }

    // Calculate effective saved amount (accounts for partial withdrawals via current_amount)
    const currentFromField = parseFloat((selectedPlanData as any)?.current_amount ?? 0);
    const sumContrib = selectedPlanData.contributions?.reduce((sum, contribution) =>
      sum + parseFloat(contribution.amount), 0) || 0;
    const effectiveSaved = currentFromField > 0 ? currentFromField : sumContrib;

    const targetAmount = parseFloat(selectedPlanData.target_amount);
    const newTotal = effectiveSaved + parseFloat(contributionData.amount);

    // Check if contribution would exceed target
    if (newTotal > targetAmount) {
      const remainingAmount = targetAmount - effectiveSaved;
      toast.error(`Amount exceeds target. You can only contribute ₦${remainingAmount.toLocaleString()} more to reach your target of ₦${targetAmount.toLocaleString()}`);
      return;
    }

    const contributionPayload = {
      ...contributionData,
      amount: parseFloat(contributionData.amount),
      store_id: selectedStore.id,
      user_id: user.id
    };

    if (!isOnline) {
      console.log('📴 Offline: Queueing contribution immediately without awaiting');

      addContribution.mutate(contributionPayload, {
        onError: (error: any) => {
          setIsContributionModalOpen(true);
          toast.error(tc('failedToSaveOffline') + ': ' + (error?.message || tc('pleaseTryAgain')));
        }
      });

      // Close immediately after queueing starts
      toast.success(tc('savedLocallyWillSync'));
      setIsContributionModalOpen(false);
      setContributionWarning(null);
      setContributionData({
        savings_plan_id: "",
        amount: "",
        contribution_date: format(new Date(), "yyyy-MM-dd")
      });
      setSelectedPlan(null);
      return;
    }

    try {
      const result = await addContribution.mutateAsync(contributionPayload);

      console.log("Contribution added successfully:", result);

      toast.success("Contribution added successfully!");
      setIsContributionModalOpen(false);
      setContributionWarning(null);
      setContributionData({
        savings_plan_id: "",
        amount: "",
        contribution_date: format(new Date(), "yyyy-MM-dd")
      });
      setSelectedPlan(null);

      // Force refresh all data
      await refetch();

    } catch (error) {
      console.error("Failed to add contribution:", error);
      toast.error("Failed to add contribution");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (confirm("Are you sure you want to delete this savings plan? This action cannot be undone.")) {
      try {
        await deleteSavingsPlan.mutateAsync(planId);
        toast.success("Savings plan deleted successfully!");
        refetch();
      } catch (error) {
        toast.error("Failed to delete savings plan");
        console.error(error);
      }
    }
  };

  const handleWithdrawSavings = async (planId: string) => {
    const plan = savingsPlans?.find(p => p.id === planId);
    if (plan) {
      setSelectedPlanForWithdrawal(plan);
      setIsWithdrawModalOpen(true);
    }
  };

  const handleConfirmWithdrawal = async (amount?: number) => {
    if (!selectedPlanForWithdrawal || !selectedStore?.id || !user?.id) return;

    const currentlyOnline = typeof navigator !== 'undefined' && navigator.onLine;

    if (typeof amount === 'number') {
      const currentAmount = (typeof selectedPlanForWithdrawal.current_amount === 'number' ? selectedPlanForWithdrawal.current_amount : parseFloat(selectedPlanForWithdrawal.current_amount)) ||
        (selectedPlanForWithdrawal.contributions?.reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0) || 0);
      if (amount <= 0 || amount > currentAmount) {
        toast.error("Invalid withdrawal amount");
        return;
      }

      const withdrawalData = {
        planId: selectedPlanForWithdrawal.id,
        amount,
        store_id: selectedStore.id,
      };

      if (!currentlyOnline) {
        withdrawPartial.mutate(withdrawalData);
        setLastWithdrawal({ planId: selectedPlanForWithdrawal.id, amount, at: new Date().toISOString() });
        setIsWithdrawModalOpen(false);
        setSelectedPlanForWithdrawal(null);
        return;
      }

      try {
        await withdrawPartial.mutateAsync(withdrawalData);
        setLastWithdrawal({ planId: selectedPlanForWithdrawal.id, amount, at: new Date().toISOString() });
        toast.success("Withdrawal recorded successfully");
        setIsWithdrawModalOpen(false);
        setSelectedPlanForWithdrawal(null);
        refetch();
      } catch (error) {
        toast.error("Failed to withdraw");
        console.error(error);
      }
      return;
    }

    const withdrawalData = {
      planId: selectedPlanForWithdrawal.id,
      storeId: selectedStore!.id
    };

    if (!currentlyOnline) {
      withdrawSavings.mutate(withdrawalData);
      setIsWithdrawModalOpen(false);
      setSelectedPlanForWithdrawal(null);
      return;
    }

    try {
      await withdrawSavings.mutateAsync(withdrawalData);
      toast.success("Savings withdrawn successfully!");
      setIsWithdrawModalOpen(false);
      setSelectedPlanForWithdrawal(null);
      refetch();
    } catch (error) {
      toast.error("Failed to withdraw savings");
      console.error(error);
    }
  };

  // Calculate contribution warning (accounts for partial withdrawals)
  const calculateContributionWarning = (amount: number, planId: string) => {
    const selectedPlanData = savingsPlans?.find(plan => plan.id === planId);
    if (!selectedPlanData) return null;

    const currentFromField = parseFloat((selectedPlanData as any)?.current_amount ?? 0);
    const sumContrib = selectedPlanData.contributions?.reduce((sum, contribution) =>
      sum + parseFloat(contribution.amount), 0) || 0;
    const effectiveSaved = currentFromField > 0 ? currentFromField : sumContrib;

    const targetAmount = parseFloat(selectedPlanData.target_amount);
    const newTotal = effectiveSaved + amount;

    if (newTotal > targetAmount) {
      const remainingAmount = targetAmount - effectiveSaved;
      return `Amount exceeds target. You can only contribute ₦${remainingAmount.toLocaleString()} more to reach your target of ₦${targetAmount.toLocaleString()}`;
    }

    return null;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'just_started':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'withdrawn':
        return <PauseCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'just_started':
        return 'bg-gray-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'withdrawn':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading savings plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#18191A]">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-1 py-1 sm:py-3 flex flex-col gap-3">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('savings.mySavings')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('savings.manageSavingsPlans')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsFilterModalOpen(true)}
                className="md:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="hidden md:flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Filter Savings Plans</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="status-filter">Status</Label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Plans</SelectItem>
                          <SelectItem value="just_started">Just Started</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="withdrawn">Withdrawn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFilterStatus("all");
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
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="hidden md:flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4" />
                    Create Savings Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Savings Plan</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreatePlan} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={createFormData.title}
                        onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                        placeholder="e.g., House rent or Shop rent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={createFormData.start_date}
                          onChange={(e) => setCreateFormData({ ...createFormData, start_date: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={createFormData.end_date}
                          onChange={(e) => setCreateFormData({ ...createFormData, end_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contributing_to">Contributing To</Label>
                      <Input
                        id="contributing_to"
                        value={createFormData.contributing_to}
                        onChange={(e) => setCreateFormData({ ...createFormData, contributing_to: e.target.value })}
                        placeholder="e.g., Iya Omo, Baba Alajo Ipata, or Self"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="savings_duration">Savings Duration</Label>
                      <Select
                        value={createFormData.savings_duration}
                        onValueChange={(value) => setCreateFormData({ ...createFormData, savings_duration: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SAVINGS_DURATION_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target_amount">Target Amount (₦)</Label>
                      <Input
                        id="target_amount"
                        type="number"
                        value={createFormData.target_amount}
                        onChange={(e) => setCreateFormData({ ...createFormData, target_amount: e.target.value })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={createSavingsPlan.isPending}>
                        {createSavingsPlan.isPending ? "Creating..." : "Create Plan"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Filter Modal */}
        <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Savings Plans</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="just_started">Just Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterStatus("all");
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

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-white dark:bg-[#18191A] border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('savings.totalPlans')}</CardTitle>
                <PiggyBank className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_plans}</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#18191A] border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('savings.activePlans')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary.active_plans}</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#18191A] border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('savings.completedPlans')}</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary.completed_plans}</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#18191A] border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('savings.totalSaved')}</CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₦{summary.total_saved.toLocaleString()}</div>
                <Progress value={summary.progress_percentage} className="mt-2 bg-green-100 dark:bg-green-900/20" />
                <p className="text-xs text-gray-500 mt-1">{summary.progress_percentage.toFixed(1)}% {t('common:ofTarget')}</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-[#18191A] border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('savings.totalWithdrawn')}</CardTitle>
                <PiggyBank className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">₦{totalWithdrawals.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">{t('common:totalAmountWithdrawn')}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Savings Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredPlans.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <PiggyBank className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No savings plans found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {filterStatus !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first savings plan to get started"}
              </p>
              {filterStatus === "all" && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Plan
                </Button>
              )}
            </div>
          ) : (
            filteredPlans.map((plan: any) => {
              // Compute contributed, withdrawals and effective saved
              const contributedSum = plan.contributions?.reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0) || 0;
              const withdrawalsSum = (plan.withdrawals || []).reduce((sum: number, w: any) => sum + Number(w.amount_withdrawn || 0), 0);
              const effectiveSaved = Math.max(0, contributedSum - withdrawalsSum);

              const progress = parseFloat(plan.target_amount) > 0
                ? (effectiveSaved / parseFloat(plan.target_amount)) * 100
                : 0;

              // Determine status based on actual contributions and database status
              let actualStatus;
              if (plan.status === 'withdrawn') {
                actualStatus = 'withdrawn';
              } else if (effectiveSaved === 0) {
                actualStatus = 'just_started';
              } else if (effectiveSaved >= parseFloat(plan.target_amount)) {
                actualStatus = 'completed';
              } else {
                actualStatus = 'in_progress';
              }

              console.log(`Plan ${plan.title}:`, {
                target: plan.target_amount,
                current_amount_from_db: plan.current_amount,
                total_contributions: contributedSum,
                withdrawals_sum: withdrawalsSum,
                effective_saved: effectiveSaved,
                progress_percentage: progress,
                status_from_db: plan.status,
                actual_status: actualStatus,
                contributions_count: plan.contributions?.length || 0
              });

              return (
                <Card key={plan.id} className="relative min-h-[320px] flex flex-col hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18191A]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{plan.title}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          Contributing to: {plan.contributing_to}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(actualStatus)} text-white flex-shrink-0 ml-2`}>
                        {getStatusIcon(actualStatus)}
                        <span className="ml-1">
                          {SAVINGS_STATUS_OPTIONS.find(s => s.value === actualStatus)?.label}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} />
                      <div className="flex justify-between text-sm">
                        <span>₦{contributedSum.toLocaleString()}</span>
                        <span>₦{parseFloat(plan.target_amount).toLocaleString()}</span>
                      </div>
                      {plan.contributions && plan.contributions.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {plan.contributions.length} contribution{plan.contributions.length !== 1 ? 's' : ''} made
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">
                          {SAVINGS_DURATION_OPTIONS.find(d => d.value === plan.savings_duration)?.label}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Period</p>
                        <p className="font-medium">
                          {format(parseISO(plan.start_date), "MMM dd")} - {format(parseISO(plan.end_date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 space-y-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-10 font-medium"
                          onClick={() => {
                            setContributionData({
                              ...contributionData,
                              savings_plan_id: plan.id
                            });
                            setContributionWarning(null);
                            setIsContributionModalOpen(true);
                          }}
                          disabled={actualStatus === 'completed' || actualStatus === 'withdrawn'}
                        >
                          {actualStatus === 'withdrawn' ? 'Plan Withdrawn' : 'Make Contribution'}
                        </Button>
                        {actualStatus !== 'withdrawn' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-10 px-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedPlanForWithdrawal(plan);
                              setIsWithdrawModalOpen(true);
                            }}
                            disabled={withdrawPartial.isPending || actualStatus === 'completed'}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-9 text-sm"
                          onClick={() => {
                            setSelectedPlanForDetails(plan);
                            setIsDetailsModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 px-3 text-sm"
                          onClick={() => handleDeletePlan(plan.id)}
                          disabled={deleteSavingsPlan.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Contribution Modal */}
        <Dialog open={isContributionModalOpen} onOpenChange={(open) => {
          setIsContributionModalOpen(open);
          if (!open) {
            setContributionWarning(null);
            setContributionData({
              savings_plan_id: "",
              amount: "",
              contribution_date: format(new Date(), "yyyy-MM-dd")
            });
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Contribution</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddContribution} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contribution_amount">Amount (₦)</Label>
                <Input
                  id="contribution_amount"
                  type="number"
                  value={contributionData.amount}
                  onChange={(e) => {
                    const amount = e.target.value;
                    setContributionData({ ...contributionData, amount });
                    const warning = calculateContributionWarning(parseFloat(amount), contributionData.savings_plan_id);
                    setContributionWarning(warning);
                  }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className={contributionWarning ? "border-red-500 focus:border-red-500" : ""}
                />
                {contributionWarning && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    ⚠️ {contributionWarning}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contribution_date">Date</Label>
                <Input
                  id="contribution_date"
                  type="date"
                  value={contributionData.contribution_date}
                  onChange={(e) => setContributionData({ ...contributionData, contribution_date: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={addContribution.isPending}>
                  {addContribution.isPending ? "Adding..." : "Add Contribution"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsContributionModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Details Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Savings Plan Details</DialogTitle>
            </DialogHeader>
            {selectedPlanForDetails && (
              <div className="space-y-6">
                {/* Calculate values for this specific plan */}
                {(() => {
                  const planContributions = selectedPlanForDetails.contributions || [];
                  const planTotalContributions = planContributions.reduce((sum: number, contribution: any) =>
                    sum + parseFloat(contribution.amount), 0);
                  const withdrawalsSum = (selectedPlanForDetails.withdrawals || []).reduce((s: number, w: any) => s + Number(w.amount_withdrawn || 0), 0);
                  const effectiveSaved = Math.max(0, planTotalContributions - withdrawalsSum);
                  const planProgress = parseFloat(selectedPlanForDetails.target_amount) > 0
                    ? (effectiveSaved / parseFloat(selectedPlanForDetails.target_amount)) * 100
                    : 0;
                  // Determine status based on effective saved and database status
                  let planStatus;
                  if (selectedPlanForDetails.status === 'withdrawn') {
                    planStatus = 'withdrawn';
                  } else if (effectiveSaved === 0) {
                    planStatus = 'just_started';
                  } else if (effectiveSaved >= parseFloat(selectedPlanForDetails.target_amount)) {
                    planStatus = 'completed';
                  } else {
                    planStatus = 'in_progress';
                  }

                  return (
                    <>
                      {/* Plan Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {(() => {
                          const planContributions = selectedPlanForDetails.contributions || [];
                          const sumContrib = planContributions.reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0);
                          const currentField = typeof selectedPlanForDetails.current_amount === 'number' ? selectedPlanForDetails.current_amount : parseFloat(selectedPlanForDetails.current_amount);
                          const effectiveSaved = !isNaN(currentField) && currentField > 0 ? currentField : sumContrib;
                          const withdrawals = (selectedPlanForDetails.withdrawals || []) as Array<{ amount_withdrawn: number }>;
                          const totalWithdrawn = withdrawals.reduce((s, r) => s + Number(r.amount_withdrawn || 0), 0);
                          return (
                            <>
                              <div>
                                <h3 className="font-semibold text-lg mb-2">{selectedPlanForDetails.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  Contributing to: {selectedPlanForDetails.contributing_to}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Duration: {SAVINGS_DURATION_OPTIONS.find(d => d.value === selectedPlanForDetails.savings_duration)?.label}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge className={`${getStatusColor(planStatus)} text-white`}>
                                  {getStatusIcon(planStatus)}
                                  <span className="ml-1">
                                    {SAVINGS_STATUS_OPTIONS.find(s => s.value === planStatus)?.label}
                                  </span>
                                </Badge>
                              </div>
                              {/* Removed Total Withdrawn box beside status as requested */}
                            </>
                          );
                        })()}
                      </div>

                      {/* Withdrawn Warning */}
                      {planStatus === 'withdrawn' && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                              <h4 className="font-medium text-red-800 dark:text-red-200">
                                Plan Withdrawn
                              </h4>
                              <p className="text-sm text-red-700 dark:text-red-300">
                                This savings plan has been withdrawn. No further contributions can be made to this plan.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Progress Section */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Progress Overview</h4>
                        {(() => {
                          const planContributions = selectedPlanForDetails.contributions || [];
                          const planTotalContributions = planContributions.reduce((sum: number, contribution: any) =>
                            sum + parseFloat(contribution.amount), 0);
                          const currentField = typeof selectedPlanForDetails.current_amount === 'number' ? selectedPlanForDetails.current_amount : parseFloat(selectedPlanForDetails.current_amount);
                          const effectiveSaved = !isNaN(currentField) && currentField > 0 ? currentField : planTotalContributions;
                          const planProgress = parseFloat(selectedPlanForDetails.target_amount) > 0
                            ? (effectiveSaved / parseFloat(selectedPlanForDetails.target_amount)) * 100
                            : 0;
                          const withdrawalsArr = (selectedPlanForDetails.withdrawals || []) as Array<{ amount_withdrawn: number }>
                          const totalWithdrawn = withdrawalsArr.reduce((s, r) => s + Number(r.amount_withdrawn || 0), 0);
                          return (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    ₦{effectiveSaved.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Saved</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    ₦{parseFloat(selectedPlanForDetails.target_amount).toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Target Amount</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {planProgress.toFixed(1)}%
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                                </div>
                                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    ₦{totalWithdrawn.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('savings.totalWithdrawn')}</p>
                                </div>
                              </div>
                              <Progress value={planProgress} className="w-full" />
                            </>
                          );
                        })()}
                      </div>

                      {/* Timeline Section */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Timeline</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Start Date</p>
                            <p className="font-medium">
                              {format(parseISO(selectedPlanForDetails.start_date), "EEEE, MMMM dd, yyyy")}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">
                              {planStatus === 'withdrawn' ? 'Withdrawal Date' : 'End Date'}
                            </p>
                            <p className="font-medium">
                              {format(parseISO(selectedPlanForDetails.end_date), "EEEE, MMMM dd, yyyy")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contributions Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Contributions History</h4>
                          <span className="text-sm text-gray-500">
                            {planContributions.length} contribution{planContributions.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {lastWithdrawal && selectedPlanForDetails?.id === lastWithdrawal.planId && (
                          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="text-sm">
                              <div className="font-medium text-red-700 dark:text-red-300">Withdrawn</div>
                              <div className="text-gray-600 dark:text-gray-400 text-xs">
                                {format(parseISO(lastWithdrawal.at), "EEEE, MMMM dd, yyyy 'at' h:mm a")}
                              </div>
                            </div>
                            <div className="text-sm font-semibold text-red-700 dark:text-red-300">₦{lastWithdrawal.amount.toLocaleString()}</div>
                          </div>
                        )}
                        {planContributions.length > 0 ? (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {planContributions
                              .sort((a: any, b: any) => new Date(b.contribution_date).getTime() - new Date(a.contribution_date).getTime())
                              .map((contribution: any, index: number) => (
                                <div key={contribution.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                      {planContributions.length - index}
                                    </div>
                                    <div>
                                      <p className="font-medium">₦{parseFloat(contribution.amount).toLocaleString()}</p>
                                      <p className="text-sm text-gray-500">
                                        {format(parseISO(contribution.contribution_date), "EEEE, MMMM dd, yyyy")}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                      {format(parseISO(contribution.created_at), "MMM dd, yyyy 'at' h:mm a")}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <PiggyBank className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No contributions made yet</p>
                            <p className="text-sm text-gray-400">Start contributing to see your progress</p>
                          </div>
                        )}
                      </div>

                      {/* Withdrawal History Section */}
                      {withdrawals && withdrawals.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Withdrawal History</h4>
                            <span className="text-sm text-gray-500">
                              {withdrawals.length} withdrawal{withdrawals.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {withdrawals.map((withdrawal: any, index: number) => (
                              <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                    {withdrawals.length - index}
                                  </div>
                                  <div>
                                    <p className="font-medium text-red-700 dark:text-red-300">₦{parseFloat(withdrawal.amount_withdrawn).toLocaleString()}</p>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                      {format(parseISO(withdrawal.withdrawal_date), "EEEE, MMMM dd, yyyy")}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    {format(parseISO(withdrawal.created_at), "MMM dd, yyyy 'at' h:mm a")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          className="flex-1"
                          onClick={() => {
                            setContributionData({
                              ...contributionData,
                              savings_plan_id: selectedPlanForDetails.id
                            });
                            setIsDetailsModalOpen(false);
                            setIsContributionModalOpen(true);
                          }}
                          disabled={planStatus === 'completed' || planStatus === 'withdrawn'}
                        >
                          {planStatus === 'withdrawn' ? 'Plan Withdrawn' : 'Add Contribution'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsDetailsModalOpen(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>


      </div>

      {/* Floating Create Savings Plan Button for Mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg">
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Savings Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  placeholder="e.g., House rent or Shop rent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={createFormData.start_date}
                    onChange={(e) => setCreateFormData({ ...createFormData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={createFormData.end_date}
                    onChange={(e) => setCreateFormData({ ...createFormData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contributing_to">Contributing To</Label>
                <Input
                  id="contributing_to"
                  value={createFormData.contributing_to}
                  onChange={(e) => setCreateFormData({ ...createFormData, contributing_to: e.target.value })}
                  placeholder="e.g., Iya Omo, Baba Alajo Ipata, or Self"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="savings_duration">Savings Duration</Label>
                <Select
                  value={createFormData.savings_duration}
                  onValueChange={(value) => setCreateFormData({ ...createFormData, savings_duration: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SAVINGS_DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_amount">Target Amount (₦)</Label>
                <Input
                  id="target_amount"
                  type="number"
                  value={createFormData.target_amount}
                  onChange={(e) => setCreateFormData({ ...createFormData, target_amount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={createSavingsPlan.isPending}>
                  {createSavingsPlan.isPending ? "Creating..." : "Create Plan"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Withdraw Savings Modal */}
        <WithdrawSavingsModal
          open={isWithdrawModalOpen}
          setOpen={setIsWithdrawModalOpen}
          plan={selectedPlanForWithdrawal}
          onConfirm={handleConfirmWithdrawal}
          isLoading={withdrawPartial.isPending || withdrawSavings.isPending}
        />
      </div>
    </div>
  );
};

export default Savings; 