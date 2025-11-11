import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
  } from "@nextui-org/modal";
import { Dispatch, SetStateAction } from "react";
import { Loader } from "../Icons";
import { Loader2 } from "lucide-react";
  type requireProps = {
    isOpen: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>;
    removeCard: () => void,
    loadingState: boolean
  }
const CancelSubScriptionModal = ({isOpen, setOpen, loadingState, removeCard}: requireProps) => {
    return (
    <Modal
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      backdrop="opaque"
      size="lg"
      className="fixed inset-0 h-[200px] flex items-center justify-center"
      classNames={{
        backdrop: "!bg-gray-950/70",
        base: "rounded-xl shadow-lg",
        closeButton: "absolute top-0 right-0",
      }}
    >
        <ModalContent className="flex flex-col m-auto items-start justify-center p-6 bg-white dark:bg-black rounded-lg border-solid border-gray border-[1px]">
            <ModalBody className="flex flex-col gap-y-4">
                <h2 className="text-[16px] text-center">YOU ARE ABOUT TO CANCEL YOUR SUBSCRIPTION</h2>
                <div className="text-[12px] text-[#818181] text-center">
                    Once your subscription expires on your next invoice date, you’ll lose access to all premium features. Read the terms and policies of use for more details 
                </div>
                <button onClick={() => removeCard()} disabled={loadingState} className="bg-[#FF7373] flex items-center justify-center rounded-[8px] py-2 w-7/12 text-[14px] text-[#FFFEFE] self-center">
                    {loadingState ?  <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Cancel my Subscription"}
                </button>
            </ModalBody>
        </ModalContent>
    </Modal>    
    )
}
export default CancelSubScriptionModal