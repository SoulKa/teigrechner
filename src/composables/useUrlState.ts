import { ref, shallowRef, watch, onMounted, onUnmounted } from 'vue'
import type { Recipe } from '@/data/recipes'

function toParam(value: unknown): string {
  return String(value)
}

function fromParam<T>(raw: string, defaultValue: T): T {
  if (typeof defaultValue === 'number') return Number(raw) as T
  return raw as T
}

const base = import.meta.env.BASE_URL // e.g. '/teigrechner/'

export function usePathRecipe<T extends Recipe>(recipes: readonly T[]) {
  const fromPath = () => {
    const slug = window.location.pathname.slice(base.length)
    return recipes.find((r) => r.slug === slug) ?? recipes[0]
  }

  const value = shallowRef<T>(fromPath())

  watch(value, (r) => {
    history.pushState(null, '', `${base}${r.slug}${window.location.search}`)
  })

  const onPopState = () => {
    value.value = fromPath()
  }
  onMounted(() => window.addEventListener('popstate', onPopState))
  onUnmounted(() => window.removeEventListener('popstate', onPopState))

  return value
}

export function useQueryParam<T>(key: string, defaultValue: T) {
  const fromQuery = () => {
    const raw = new URLSearchParams(window.location.search).get(key)
    return raw !== null ? fromParam(raw, defaultValue) : defaultValue
  }

  const value = ref<T>(fromQuery())

  watch(value, (v) => {
    const params = new URLSearchParams(window.location.search)
    params.set(key, toParam(v))
    history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  })

  return value
}
