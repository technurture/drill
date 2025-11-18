import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

const LogoutModal = ({
  isOpen,
  setOpen,
}: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { signOut, user } = useAuth();
  const { t } = useTranslation('common');
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success(t('loggedOutSuccess'));
      setOpen(false);
    } catch (error) {
      toast.error(t('logoutError'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      backdrop="blur"
      size="sm"
      className="flex items-center justify-center"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "rounded-2xl shadow-2xl border-0",
        closeButton: "hidden",
      }}
    >
      <ModalContent className="bg-white dark:bg-[#18191A] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
        <ModalHeader className="flex flex-col gap-1 p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('signOut')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="px-6 pb-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {t('signOutConfirmation')}
          </p>
        </ModalBody>

        <ModalFooter className="p-6 pt-0 flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setOpen(false)}
          >
            {t('cancel')}
          </button>
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            {t('signOut')}
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LogoutModal;
