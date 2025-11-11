import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Dispatch, SetStateAction } from "react";

const DeleteNoteModal = ({
  isOpen,
  setOpen,
  handleDelete,
  saleId,
}: {
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<{ note: boolean; expiry: boolean }>>;
  handleDelete: (id: string) => void;
  saleId: string;
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setOpen((prev) => ({ ...prev, note: false }))}
      backdrop="opaque"
      size="lg"
      className="fixed inset-0 h-[200px] flex items-center justify-center"
      classNames={{
        backdrop: "!bg-gray-950/70",
        base: "rounded-xl shadow-lg",
        closeButton: "hidden",
      }}
    >
      <ModalContent className="flex flex-col m-auto items-start justify-center p-6 bg-white dark:bg-black  rounded-lg border-solid border-gray border-[1px]">
        <ModalHeader className="text-lg font-bold text-left">
          Are you sure?
        </ModalHeader>
        <ModalBody className="-mt-4">
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. This will permanently delete the note
            and its associated data.
          </p>
        </ModalBody>
        <ModalFooter className="flex justify-center self-end gap-4">
          <button
            className="px-4 py-2 bg-black text-white border-[1px] border-gray border-solid rounded-lg"
            onClick={() => setOpen((prev) => ({ ...prev, note: false }))}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-white text-black rounded-lg"
            onClick={() => {
              handleDelete(saleId);
              setOpen((prev) => ({ ...prev, note: false }));
            }}
          >
            Delete
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteNoteModal;
