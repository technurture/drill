import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Trash2,
  Edit,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { useTranslation } from "react-i18next";

const SalesMobileView = ({
  sale,
  onDelete,
  canEditSales,
}) => {
  const { t } = useTranslation('pages');
  const [isOpen, setIsOpen] = React.useState(false);
  const handleAction = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <Dialog key={sale?.id} open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className="flex items-center z-0 justify-between p-4 border-b cursor-pointer hover:bg-accent"
        >
          <div className="flex-1">
            <p className="font-medium">
              {sale.items && sale.items.length > 0
                ? sale.items
                    .map((item) => item.product?.name)
                    .filter(Boolean)
                    .join(", ")
                : "N/A"}
            </p>
            <p className="text-sm text-muted-foreground">
              ₦{sale.total_price?.toFixed(2) ?? "N/A"}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-md overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => handleAction(e, () => setIsOpen(false))}
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <DialogTitle>Sale Details</DialogTitle>
          </div>
        </DialogHeader>
        <div className="mt-6 space-y-6 pb-20">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('sales.transactionId')}
              </h4>
              <p className="mt-1">{sale.id}</p>
            </div>
            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('sales.dateTime')}
              </h4>
              <p className="mt-1">
                {isValid(new Date(sale.created_at))
                  ? format(new Date(sale.created_at), "dd MMM yyyy, HH:mm")
                  : t('sales.invalidDate')}
              </p>
            </div>
            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('sales.products')}
              </h4>
              <p className="mt-1">
                {sale.items && sale.items.length > 0
                  ? sale.items
                      .map((item) => item.product?.name)
                      .filter(Boolean)
                      .join(", ")
                  : "N/A"}
              </p>
            </div>
            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('sales.totalAmount')}
              </h4>
              <p className="mt-1">₦{sale.total_price?.toFixed(2) ?? "N/A"}</p>
            </div>
            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('sales.paymentMode')}
              </h4>
              <p className="mt-1">{sale.payment_mode}</p>
            </div>
            <Separator />

            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                {t('sales.soldBy')}
              </h4>
              <p className="mt-1">{sale?.sales_rep_name}</p>
            </div>
          </div>

          <div className="flex space-x-2 mt-6">
            {canEditSales && (
              <>
                <Button
                  variant="outline"
                  onClick={(e) => handleAction(e, () => onDelete(sale))}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SalesMobileView;
