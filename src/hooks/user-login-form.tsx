import { create } from "zustand";

interface loginFormStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useloginForm = create<loginFormStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useloginForm;
