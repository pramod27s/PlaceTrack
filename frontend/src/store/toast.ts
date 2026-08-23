import { create } from 'zustand'

export type ToastType = 'success' | 'info' | 'error' | 'warning'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  title: string
  message?: string
  type: ToastType
  action?: ToastAction
  durationMs?: number
}

interface ToastState {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => string
  dismissToast: (id: string) => void
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  showToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { ...toast, id, durationMs: toast.durationMs ?? 5000 }
    set((state) => ({
      toasts: [...state.toasts.slice(-4), newToast], // Keep max 5 toasts
    }))
    return id
  },
  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))
