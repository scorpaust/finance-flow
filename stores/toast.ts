import { defineStore } from 'pinia'
import type { Toast } from '~/types'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function add(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).slice(2)
    toasts.value.push({ ...toast, id })
    setTimeout(() => remove(id), toast.duration || 4000)
    return id
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const success = (message: string) => add({ type: 'success', message })
  const error = (message: string) => add({ type: 'error', message })
  const info = (message: string) => add({ type: 'info', message })
  const warning = (message: string) => add({ type: 'warning', message })

  return { toasts, add, remove, success, error, info, warning }
})
