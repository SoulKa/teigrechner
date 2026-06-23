<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import RecipeDisplay from './components/RecipeDisplay.vue'
import PizzaSnow from './components/PizzaSnow.vue'
import { Recipe } from './data/recipes'
import { usePathRecipe, useQueryParam } from '@/composables/useUrlState'

const recipes = [Recipe.NEW_HAVEN, Recipe.NEAPOLITAN, Recipe.FLAMMKUCHEN] as const
const selectedRecipe = usePathRecipe(recipes)

const snowEnabled = useQueryParam('snow', true)
const snowEmoji = computed(() => selectedRecipe.value === Recipe.FLAMMKUCHEN ? '🧅' : '🍕')

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
const darkMode = useQueryParam('theme', prefersDark.matches ? 'dark' : 'light')

watchEffect(() => {
  document.documentElement.setAttribute('data-theme', darkMode.value === 'dark' ? 'dark' : 'light')
})
</script>

<template>
  <div id="app">
    <PizzaSnow
      :pizza-count="selectedRecipe.portions"
      :emoji="snowEmoji"
      :enabled="snowEnabled"
    />

    <header class="topbar">
      <div class="brand">Teigrechner</div>
      <div class="topbar-actions">
        <button
           class="theme-toggle"
           :title="darkMode === 'dark' ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren'"
           @click="darkMode = darkMode === 'dark' ? 'light' : 'dark'"
         >{{ darkMode === 'dark' ? '☀️' : '🌚' }}</button>
        <button
          class="snow-toggle"
          :class="{ active: snowEnabled }"
          :title="snowEnabled ? 'Schnee ausschalten' : 'Schnee einschalten'"
          @click="snowEnabled = !snowEnabled"
        >❄️</button>
        <label class="recipe-select">
          <span>Rezept wählen</span>
          <select v-model="selectedRecipe">
            <option v-for="recipe in recipes" :key="recipe.name" :value="recipe">
              {{ recipe.name }}
            </option>
          </select>
        </label>
      </div>
    </header>

    <main class="content">
      <RecipeDisplay :recipe="selectedRecipe" />
    </main>
  </div>
</template>

<style>
:root,
[data-theme="light"] {
  --color-bg: #f8fafc;
  --color-text: #0f172a;
  --color-border: #e2e8f0;
  --color-accent: #d97706;
  --color-muted: #6b7280;
  --color-label: #4b5563;
  --color-heading: #1f2937;
  --color-body-text: #374151;
  --color-divider: #f3f4f6;
  --color-input-border: #e5e7eb;
  --color-input-bg: #ffffff;
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-border: #334155;
  --color-accent: #f59e0b;
  --color-muted: #94a3b8;
  --color-label: #cbd5e1;
  --color-heading: #f1f5f9;
  --color-body-text: #cbd5e1;
  --color-divider: #1e293b;
  --color-input-border: #334155;
  --color-input-bg: #1e293b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--color-bg);
  transition: background 0.2s, color 0.2s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#app {
  min-height: 100vh;
  color: var(--color-text);
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #0f172a;
  color: #f8fafc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.brand {
  font-weight: 700;
  letter-spacing: 0.02em;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.snow-toggle,
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: opacity 0.2s;
  line-height: 1;
}

.snow-toggle {
  opacity: 0.35;
}

.snow-toggle.active {
  opacity: 1;
}

.theme-toggle {
  opacity: 1;
}

.recipe-select {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
}

.recipe-select select {
  padding: 0.4rem 0.6rem;
  border-radius: 0.375rem;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  color: #0f172a;
  font-size: 0.95rem;
}

.recipe-select select:focus {
  outline: none;
  border-color: #d97706;
}

.content {
  padding: 2rem 1.5rem 3rem;
}

@media (max-width: 640px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .content {
    padding: 1.5rem 1rem 2.5rem;
  }
}
</style>
