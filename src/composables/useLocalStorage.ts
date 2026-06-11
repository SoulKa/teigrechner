import { ref, watch } from 'vue'

const PREFIX = 'teigrechner:'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(PREFIX + key)
  const value = ref<T>(stored !== null ? (JSON.parse(stored) as T) : defaultValue)
  watch(value, (v) => localStorage.setItem(PREFIX + key, JSON.stringify(v)))
  return value
}
