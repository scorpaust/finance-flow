import { defineStore } from 'pinia'

export interface Group {
  _id: string
  name: string
  description?: string
  color: string
  monthlyLimit?: number
  weeklyLimit?: number
  alertThreshold?: number
  transactionCount?: number
  total?: number
  monthlySpent?: number
  createdAt: Date
}

export const useGroupsStore = defineStore('groups', () => {
  const groups = ref<Group[]>([])
  const loading = ref(false)

  async function fetchGroups() {
    loading.value = true
    try {
      groups.value = await $fetch<Group[]>('/api/groups')
    } finally {
      loading.value = false
    }
  }

  async function createGroup(data: Partial<Group>) {
    const g = await $fetch<Group>('/api/groups', { method: 'POST', body: data })
    groups.value.unshift(g)
    return g
  }

  async function updateGroup(id: string, data: Partial<Group>) {
    const g = await $fetch<Group>(`/api/groups/${id}`, { method: 'PUT', body: data })
    const idx = groups.value.findIndex((g) => g._id === id)
    if (idx >= 0) groups.value[idx] = g
    return g
  }

  async function deleteGroup(id: string) {
    await $fetch(`/api/groups/${id}`, { method: 'DELETE' })
    groups.value = groups.value.filter((g) => g._id !== id)
  }

  return { groups, loading, fetchGroups, createGroup, updateGroup, deleteGroup }
})
