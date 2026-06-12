<script setup lang="ts">
import { ref, computed } from 'vue'
import RecipeDisplay from './components/RecipeDisplay.vue'
import PizzaSnow from './components/PizzaSnow.vue'
import { Recipe } from './data/recipes'
import { usePathRecipe } from '@/composables/useUrlState'

const recipes = [Recipe.NEW_HAVEN, Recipe.NEAPOLITAN, Recipe.FLAMMKUCHEN] as const
const selectedRecipe = usePathRecipe(recipes)

const snowEnabled = ref(true)
const snowEmoji = computed(() => selectedRecipe.value === Recipe.FLAMMKUCHEN ? '🧅' : '🍕')
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #f8fafc;
}

#app {
  min-height: 100vh;
  color: #0f172a;
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

.snow-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  border-radius: 0.25rem;
  opacity: 0.35;
  transition: opacity 0.2s;
  line-height: 1;
}

.snow-toggle.active {
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
