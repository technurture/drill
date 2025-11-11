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
        toast.success("Withdrawal request placed", { duration: 5000 });
        updateEarn();
        navigate("/dashboard");
      })
      .catch(() => {
        toast.error("Error placing withdrawal request");
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
          Withdraw your Earnings
          <span className="text-[13px] font-normal">
            To withdraw your earnings, please enter your bank details
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
                  placeholder="Account Number"
                  type="text"
                  className="w-full"
                  id="account_number"
                  {...register("account_number", { required: true })}
                />
              </div>
              <div className="flex flex-col gap-y-4">
                <Input
                  placeholder="Account Name"
                  type="text"
                  className="w-full"
                  id="account_name"
                  {...register("account_name", { required: true })}
                />
              </div>
              <div className="flex flex-col gap-y-4">
                <Input
                  placeholder="Bank Name"
                  type="text"
                  className="w-full"
                  id="bank_name"
                  {...register("bank_name", { required: true })}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-red-400 text-[13px]">Please Note</p>
              <span className="text-[10px]">
                Check the account details well, as we would not be liable for
                sending your earnings to the wrong account it takes within 2 - 5
                working days to process your earning, if after 5 days you've not
                received your payment, please send a message to
                support@storeer.ng
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
              {isLoading ?  <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Submit"}
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
export default WithdrawalModal;
