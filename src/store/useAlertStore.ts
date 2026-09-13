import { create } from 'zustand';

interface AlertState {
  isOpen: boolean;
  mode: 'alert' | 'confirm';
  message: string;
  onConfirm?: () => void;
  showAlert: (message: string, onConfirm?: () => void) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
  closeAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  mode: 'alert',
  message: '',
  onConfirm: undefined,
  showAlert: (message, onConfirm) => set({ isOpen: true, message, onConfirm, mode: 'alert' }),
  showConfirm: (message, onConfirm) => set({ isOpen: true, message, onConfirm, mode: 'confirm' }),
  closeAlert: () => set({ isOpen: false, message: '', onConfirm: undefined }),
}));