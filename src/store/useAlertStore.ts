import { create } from 'zustand';

interface ConfirmOptions {
  title?: string;
  wide?: boolean;
}

interface AlertState {
  isOpen: boolean;
  mode: 'alert' | 'confirm';
  message: string;
  title: string;
  wide: boolean;
  onConfirm?: () => void;
  showAlert: (message: string, onConfirm?: () => void) => void;
  showConfirm: (message: string, onConfirm: () => void, options?: ConfirmOptions) => void;
  closeAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  mode: 'alert',
  message: '',
  title: '알림',
  wide: false,
  onConfirm: undefined,
  showAlert: (message, onConfirm) => set({ isOpen: true, message, onConfirm, mode: 'alert', title: '알림', wide: false }),
  showConfirm: (message, onConfirm, options) => set({ isOpen: true, message, onConfirm, mode: 'confirm', title: options?.title ?? '알림', wide: options?.wide ?? false }),
  closeAlert: () => set({ isOpen: false, message: '', onConfirm: undefined, title: '알림', wide: false }),
}));
