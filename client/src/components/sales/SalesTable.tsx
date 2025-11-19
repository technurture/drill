import React, { useEffect, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Trash2,
  Edit,
  Check,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { formatNumber } from "@/utils/formatNumber";
import SalesMobileView from "./SalesMobileView";
import { useTranslation } from "react-i18next";

const SalesTable = ({ sales, onDelete }) => {
  const { t } = useTranslation('pages');
  const { canEditSales } = usePermissions();

  if (!sales || sales.length === 0) {
    return <div>{t('sales.noSalesDataAvailable')}</div>;
  }

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden space-y-2">
        {sales.map((sale) => (
          <SalesMobileView
            key={sale.id}
            sale={sale}
            onDelete={onDelete}
            canEditSales={canEditSales}
          />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/12">{t('sales.dateTime')}</TableHead>
              <TableHead className="w-2/12 max-w-[120px] truncate">{t('sales.productSold')}</TableHead>
              <TableHead className="w-1/12">{t('sales.totalAmount')}</TableHead>
              <TableHead className="w-1/12">{t('sales.paymentMode')}</TableHead>
              <TableHead className="w-1/12">{t('sales.soldBy')}</TableHead>
              <TableHead className="w-1/12">{t('sales.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  {isValid(new Date(sale.created_at))
                    ? format(new Date(sale.created_at), "dd MMM yyyy, HH:mm")
                    : t('sales.invalidDate')}
                </TableCell>
                <TableCell className="w-2/12 max-w-[120px] truncate whitespace-nowrap overflow-hidden text-ellipsis">
                  {sale.items && sale.items.length > 0
                    ? sale.items
                        .map((item) => item.product?.name)
                        .filter(Boolean)
                        .join(", ")
                    : "N/A"}
                </TableCell>
                <TableCell>
                  ₦{formatNumber(sale.total_price) ?? "N/A"}
                </TableCell>
                <TableCell className="w-1/12 whitespace-nowrap">
                  {sale.payment_mode === 'bank_transfer'
                    ? t('sales.bankTransfer')
                    : sale.payment_mode === 'credit'
                    ? t('sales.credit')
                    : sale.payment_mode === 'cash'
                    ? t('sales.cash')
                    : sale.payment_mode}
                </TableCell>
                <TableCell>{sale?.sales_rep_name}</TableCell>
                <TableCell className="w-1/12 whitespace-nowrap">
                  <div className="flex flex-row items-center gap-1">
                    <Button variant="ghost" onClick={() => onDelete(sale)} className="flex items-center gap-1">
                      <Trash2 size={16} className="text-red-600" />
                      <span className="text-xs text-red-600">{t('inventory.delete')}</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default SalesTable;
