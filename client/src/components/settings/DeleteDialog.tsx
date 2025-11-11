import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import { AlertTriangle, Trash2, Store, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteDialogProps {
  actionStatement: string;
  details: string;
  action: () => void;
  type: "store" | "account";
  storeName?: string;
}

const DeleteDialog = ({
  actionStatement,
  details,
  action,
  type,
  storeName,
}: DeleteDialogProps) => {
  const [inputValue, setInputValue] = useState("");
  const [randomText, setRandomText] = useState("");
  const [isValid, setIsValid] = useState(false);

  // Generate random text for account deletion
  useEffect(() => {
    if (type === "account") {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
      let result = "";
      for (let i = 0; i < 20; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setRandomText(result);
    }
  }, [type]);

  // Validate input
  useEffect(() => {
    if (type === "store") {
      setIsValid(inputValue === storeName);
    } else {
      setIsValid(inputValue === randomText);
    }
  }, [inputValue, storeName, randomText, type]);

  const handleAction = () => {
    if (isValid) {
      action();
      setInputValue("");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm" 
          className="font-semibold hover:bg-destructive/90 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {type === "store" ? <Store className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
          {actionStatement}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md mx-4">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {type === "store" ? "Delete Store" : "Delete Account"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {details}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {type === "store" ? (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                To confirm deletion, please type the store name:
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter store name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className={cn(
                    "transition-all duration-200",
                    isValid && inputValue 
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                      : "border-gray-300 dark:border-gray-600"
                  )}
                />
                {isValid && inputValue && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Store name: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{storeName}</span>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                To confirm deletion, please type this text below:
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter the text above"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className={cn(
                    "transition-all duration-200 font-mono text-sm",
                    isValid && inputValue 
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                      : "border-gray-300 dark:border-gray-600"
                  )}
                />
                {isValid && inputValue && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1"> Type this text:</p>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                  {randomText}
                </p>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={!isValid}
            className={cn(
              "w-full sm:w-auto order-1 sm:order-2 transition-all duration-200",
              isValid 
                ? "bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl" 
                : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
            )}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {type === "store" ? "Delete Store" : "Delete Account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
