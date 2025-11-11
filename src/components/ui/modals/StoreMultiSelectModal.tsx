import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useStores } from '@/integrations/supabase/hooks/stores';
import { useAuth } from '@/contexts/AuthContext';

const StoreMultiSelectModal = ({ isOpen, setOpen, onConfirm }) => {
  const { user } = useAuth();
  const { data: stores, isLoading } = useStores(user?.id || '');
  const [selected, setSelected] = useState([]);
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected([]);
      setAllSelected(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (stores && stores.length > 0) {
      if (allSelected) {
        setSelected(stores.map((s) => s.id));
      } else if (!allSelected && selected.length === stores.length) {
        setSelected([]);
      }
    }
    // eslint-disable-next-line
  }, [allSelected]);

  const handleToggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (stores && selected.length === stores.length) {
      setSelected([]);
      setAllSelected(false);
    } else if (stores) {
      setSelected(stores.map((s) => s.id));
      setAllSelected(true);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" open={isOpen} onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-xl font-bold text-center w-full">Select Store(s)</Dialog.Title>
                  <button
                    className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <Dialog.Description className="text-sm text-muted-foreground mb-4 text-center">
                  Choose one or more stores to add your product(s) to. You can select multiple stores at once.
                </Dialog.Description>
                <div className="w-full flex items-center justify-start mb-2 px-2">
                  <Button
                    variant={allSelected ? 'default' : 'outline'}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${allSelected ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-100 hover:bg-green-200 text-green-800 border-green-600'}`}
                    onClick={handleSelectAll}
                    disabled={isLoading || !stores || stores.length === 0}
                  >
                    {selected.length === stores?.length ? 'Unselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="flex flex-col items-center justify-center px-2 pb-0">
                  {isLoading && <div className="py-8">Loading stores...</div>}
                  {!isLoading && stores && stores.length > 0 && (
                    <div className="flex flex-col gap-4 w-full max-h-60 overflow-y-auto mb-2">
                      {stores.map((store) => (
                        <div key={store.id} className="flex items-center justify-between w-full border rounded-lg px-4 py-3 bg-accent/10 dark:bg-accent/5">
                          <span className="font-medium text-base">{store.store_name}</span>
                          <Button
                            onClick={() => handleToggle(store.id)}
                            className={`ml-4 px-6 py-2 text-base font-semibold rounded-lg transition-colors duration-200 h-full ${selected.includes(store.id) ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-100 hover:bg-green-200 text-green-800'}`}
                          >
                            {selected.includes(store.id) ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {!isLoading && (!stores || stores.length === 0) && <div className="py-8 text-center">No stores found.</div>}
                </div>
                <div className="flex flex-col items-center justify-center gap-2 px-2 pb-2 pt-4">
                  <Button variant="ghost" onClick={() => setOpen(false)} className="w-full">Cancel</Button>
                  <Button
                    onClick={() => {
                      onConfirm(selected);
                      setOpen(false);
                    }}
                    disabled={selected.length === 0}
                    className="w-full font-semibold text-base py-3 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Confirm
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default StoreMultiSelectModal; 