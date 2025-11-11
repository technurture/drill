import React, { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StoreContext } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAddFinancialRecord } from "@/integrations/supabase/hooks/finance";
import { format } from "date-fns";
import { toast } from "sonner";

interface AddFinancialRecordModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultType?: 'income' | 'expense';
}

const AddFinancialRecordModal: React.FC<AddFinancialRecordModalProps> = ({ 
  open, 
  setOpen, 
  defaultType = 'income' 
}) => {
  const selectedStore = useContext(StoreContext);
  const { user } = useAuth();
  const addFinancialRecord = useAddFinancialRecord();

  const [formData, setFormData] = useState({
    type: defaultType,
    reason: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd")
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStore?.id || !user?.id) {
      toast.error("Store and user information required");
      return;
    }

    try {
      await addFinancialRecord.mutateAsync({
        store_id: selectedStore.id,
        user_id: user.id,
        type: formData.type as 'income' | 'expense',
        reason: formData.reason,
        amount: parseFloat(formData.amount),
        date: formData.date
      });
      
      toast.success(`${formData.type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      setOpen(false);
      setFormData({
        type: defaultType,
        reason: "",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd")
      });
    } catch (error) {
      console.error("Error adding financial record:", error);
      toast.error("Failed to add financial record");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {defaultType === 'income' ? 'Income' : 'Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as 'income' | 'expense'})}>
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
              placeholder={defaultType === 'income' ? "e.g., Sales revenue, Investment returns" : "e.g., Rent payment, Equipment purchase"}
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
              {addFinancialRecord.isPending ? "Adding..." : `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFinancialRecordModal;
