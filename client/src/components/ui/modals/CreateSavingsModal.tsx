import React, { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StoreContext } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateSavingsPlan } from "@/integrations/supabase/hooks/savings";
import { format } from "date-fns";
import { toast } from "sonner";
import { SAVINGS_DURATION_OPTIONS, type SavingsDuration } from "@/types/savings.types";
import { useTranslation } from "react-i18next";

interface CreateSavingsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CreateSavingsModal: React.FC<CreateSavingsModalProps> = ({ open, setOpen }) => {
  const selectedStore = useContext(StoreContext);
  const { user } = useAuth();
  const createSavingsPlan = useCreateSavingsPlan();
  const { t } = useTranslation('common');

  const [formData, setFormData] = useState<{
    title: string;
    start_date: string;
    end_date: string;
    contributing_to: string;
    savings_duration: SavingsDuration;
    target_amount: string;
  }>({
    title: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // 30 days from now
    contributing_to: "",
    savings_duration: "weekly",
    target_amount: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStore?.id || !user?.id) {
      toast.error("Store and user information required");
      return;
    }

    const planData = {
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      store_id: selectedStore.id,
      user_id: user.id
    };

    const currentlyOnline = typeof navigator !== 'undefined' && navigator.onLine;
    
    if (!currentlyOnline) {
      createSavingsPlan.mutate(planData);
      
      setOpen(false);
      setFormData({
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
      setOpen(false);
      setFormData({
        title: "",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        contributing_to: "",
        savings_duration: "weekly",
        target_amount: ""
      });
    } catch (error) {
      console.error("Error creating savings plan:", error);
      toast.error("Failed to create savings plan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('create')} {t('plan')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('title')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., House rent or Shop rent"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">{t('startDate')}</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">{t('endDate')}</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contributing_to">{t('contributingTo')}</Label>
            <Input
              id="contributing_to"
              value={formData.contributing_to}
              onChange={(e) => setFormData({...formData, contributing_to: e.target.value})}
              placeholder="e.g., Iya Omo, Baba Alajo Ipata, or Self"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="savings_duration">{t('savingsDuration')}</Label>
            <Select value={formData.savings_duration} onValueChange={(value) => setFormData({...formData, savings_duration: value as SavingsDuration})}>
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
            <Label htmlFor="target_amount">{t('targetAmount')} (₦)</Label>
            <Input
              id="target_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.target_amount}
              onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={createSavingsPlan.isPending}>
              {createSavingsPlan.isPending ? t('creating') : t('createPlan')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSavingsModal;
