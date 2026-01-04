<script setup lang="ts">
import { ref } from 'vue'
import RecipeDisplay from './components/RecipeDisplay.vue'
import PizzaSnow from './components/PizzaSnow.vue'
import { Recipe } from './data/recipes'

const recipes = [Recipe.NEW_HAVEN, Recipe.NEAPOLITAN] as const
const selectedRecipe = ref<Recipe>(recipes[0])
</script>

<template>
  <div id="app">
    <PizzaSnow />
    <header class="topbar">
      <div class="brand">Teigrechner</div>
      <label class="recipe-select">
        <span>Rezept wählen</span>
        <select v-model="selectedRecipe">
          <option v-for="recipe in recipes" :key="recipe.name" :value="recipe">
            {{ recipe.name }}
          </option>
        </select>
      </label>
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
