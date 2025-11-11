import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
const DeleteSalesRepModal = ({
  isOpen,
  setOpen,
  deleteSalesRep,
  id,
}: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  deleteSalesRep: (id: string) => void;
  id: string;
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      backdrop="opaque"
      size="lg"
      className="fixed inset-0 h-[200px] py-4 flex items-center justify-center"
      classNames={{
        backdrop: "!bg-gray-950/70",
        base: "rounded-xl shadow-lg",
        closeButton: "hidden",
      }}
    >
      <ModalContent className="flex flex-col m-auto items-center justify-center bg-white dark:bg-black rounded-lg border-solid border-gray border-[1px]">
        <ModalHeader className="text-lg font-bold self-start">
          Are you sure ?
        </ModalHeader>
        <ModalBody className="-mt-4 w-full">
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. This will permanently delete the sales
            rep.
          </p>
        </ModalBody>
        <ModalFooter className="flex justify-center self-end gap-4">
          <button
            className="px-4 py-2 bg-black text-white border-[1px] border-gray border-solid rounded-lg"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-white text-black rounded-lg"
            onClick={() => {
              deleteSalesRep(id);
              setOpen(false);
            }}
          >
            Delete
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default DeleteSalesRepModal;
