import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, PiggyBank } from "lucide-react";
import { Input } from "@/components/ui/input";

interface WithdrawSavingsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  plan: any;
  onConfirm: (amount: number) => void;
  isLoading: boolean;
}

const WithdrawSavingsModal: React.FC<WithdrawSavingsModalProps> = ({ 
  open, 
  setOpen, 
  plan, 
  onConfirm, 
  isLoading 
}) => {
  if (!plan) return null;

  const currentContributions = useMemo(() => {
    const currentField = typeof plan.current_amount === 'number' ? plan.current_amount : parseFloat(plan.current_amount);
    if (!isNaN(currentField) && currentField > 0) return currentField;
    return plan.contributions?.reduce((sum: number, contribution: any) => sum + parseFloat(contribution.amount), 0) || 0;
  }, [plan]);

  const [amount, setAmount] = useState<string>("");
  const numericAmount = parseFloat(amount) || 0;
  const maxWithdraw = currentContributions;
  const isInvalid = numericAmount <= 0 || numericAmount > maxWithdraw;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-blue-600" />
            Withdraw from Savings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Current Balance */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Plan</span>
              <span className="font-medium">{plan.title}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Current Saved</span>
              <span className="font-medium">₦{currentContributions.toLocaleString()}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount to withdraw</label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={isInvalid && amount !== "" ? "border-red-500" : ""}
            />
            <div className="text-xs text-gray-500">Max: ₦{maxWithdraw.toLocaleString()}</div>
            {isInvalid && amount !== "" && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <AlertTriangle className="h-3 w-3" />
                Enter an amount between 0 and ₦{maxWithdraw.toLocaleString()}
              </div>
            )}
          </div>

          {/* Note */}
          <div className="text-xs text-gray-600 dark:text-gray-400">
            This will reduce your savings and progress for this plan. You cannot withdraw more than you’ve saved.
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => onConfirm(numericAmount)}
            disabled={isLoading || isInvalid}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Processing..." : "Withdraw"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawSavingsModal;
