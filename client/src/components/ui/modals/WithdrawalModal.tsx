import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAddWithdrawal } from "@/integrations/supabase/hooks/withdrawal";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { useUpdateEarnings } from "@/integrations/supabase/hooks/earning";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const WithdrawalModal = ({
  isOpen,
  setOpen,
  balance,
  total_balance,
}: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  balance: number;
  total_balance: number;
}) => {
  const { register, handleSubmit, reset, watch } = useForm();
  const withdraw = useAddWithdrawal();
  const [isLoading, setLoading] = useState(false);
  const { user } = useAuth();
  const updateEarning = useUpdateEarnings();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const updateEarn = async () => {
    await updateEarning.mutateAsync({
      user_id: user?.id,
      available_balance: 0,
      total_earnings: total_balance,
    });
  };
  const onSubmit = async (data) => {
    setLoading(true);
    await withdraw
      .mutateAsync({
        user_id: user?.id,
        user_email: user?.email,
        amount: balance,
        status: "pending",
        account_name: data?.account_name,
        account_number: data?.account_number,
        bank_name: data?.bank_name,
      })
      .then(() => {
        toast.success(t('withdrawalRequestPlaced'), { duration: 5000 });
        updateEarn();
        navigate("/dashboard");
      })
      .catch(() => {
        toast.error(t('withdrawalRequestError'));
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      backdrop="opaque"
      size="lg"
      className="fixed inset-0 h-[280px] overflow-y-scroll flex items-center justify-center"
      classNames={{
        backdrop: "!bg-gray-950/70",
        base: "rounded-lg shadow-lg",
        closeButton: "hidden",
      }}
    >
      <ModalContent className="flex flex-col m-auto bg-white dark:bg-black rounded-lg border-none">
        <ModalHeader className="text-[16px] font-bold flex flex-col w-full justify-start">
          {t('withdrawYourEarnings')}
          <span className="text-[13px] font-normal">
            {t('enterBankDetails')}
          </span>
        </ModalHeader>
        <ModalBody className="w-full">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-y-4 h-full"
          >
            <div className="flex items-center w-full gap-x-4">
              <div className="flex flex-col gap-y-4">
                <Input
                  placeholder={t('accountNumber')}
                  type="text"
                  className="w-full"
                  id="account_number"
                  {...register("account_number", { required: true })}
                />
              </div>
              <div className="flex flex-col gap-y-4">
                <Input
                  placeholder={t('accountName')}
                  type="text"
                  className="w-full"
                  id="account_name"
                  {...register("account_name", { required: true })}
                />
              </div>
              <div className="flex flex-col gap-y-4">
                <Input
                  placeholder={t('bankName')}
                  type="text"
                  className="w-full"
                  id="bank_name"
                  {...register("bank_name", { required: true })}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-red-400 text-[13px]">{t('pleaseNote')}</p>
              <span className="text-[10px]">
                {t('withdrawalNote')}
              </span>
            </div>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !watch("account_number") ||
                !watch("account_name") ||
                !watch("bank_name")
              }
              className={`w-4/12 mb-0`}
            >
              {isLoading ?  <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : t('submit')}
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
export default WithdrawalModal;
