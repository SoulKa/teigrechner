<script setup lang="ts">
import { computed, watch } from 'vue'
import { Recipe, RecipeScaler, OvenType } from '@/data/recipes'
import PizzaSnow from './PizzaSnow.vue'
import { useLocalStorage } from '@/composables/useLocalStorage'

const props = defineProps<{
  recipe: Recipe
}>()

const selectedOven = useLocalStorage<OvenType>('oven', OvenType.KITCHEN)
const pizzaSize = useLocalStorage('pizza-size', props.recipe.diameter)
const pizzaCount = useLocalStorage('pizza-count', props.recipe.portions)
const scaledRecipe = computed(() =>
  RecipeScaler.scale(props.recipe, pizzaSize.value, pizzaCount.value),
)

// when the recipe changes, try to keep the same amount of flour used by adjusting the pizza count
watch(
  () => props.recipe,
  (newRecipe, oldRecipe) => {
    const previousFlour = oldRecipe.flour.quantity.amount * (pizzaCount.value / oldRecipe.portions)
    const newFlourPerPizza = newRecipe.flour.quantity.amount / newRecipe.portions
    pizzaCount.value = Math.max(1, Math.round(previousFlour / newFlourPerPizza))
    pizzaSize.value = newRecipe.diameter
  },
)
</script>

<template>
  <div class="recipe-container">
    <PizzaSnow :pizza-count="pizzaCount" />
    <div class="recipe-header">
      <h1>{{ recipe.name }}</h1>
      <p class="description">{{ recipe.description }}</p>

      <div class="recipe-controls">
        <div class="control-group">
          <label for="pizza-size">Pizza Größe (cm)</label>
          <input
            id="pizza-size"
            type="number"
            v-model.number="pizzaSize"
            min="15"
            max="50"
            step="1"
          />
        </div>
        <div class="control-group">
          <label for="pizza-count">Anzahl Pizzen</label>
          <input
            id="pizza-count"
            type="number"
            v-model.number="pizzaCount"
            min="1"
            max="20"
            step="1"
          />
        </div>
      </div>
    </div>

    <div class="recipe-content">
      <section class="ingredients-section">
        <h2>Zutaten</h2>
        <ul class="ingredients-list">
          <li
            v-for="(entry, index) in scaledRecipe.ingredients"
            :key="index"
            class="ingredient-item"
          >
            <div class="ingredient-text">
              <span class="ingredient-amount">{{ entry.quantity }}</span>
              <span class="ingredient-name">{{ entry.ingredient.name }}</span>
            </div>
          </li>
        </ul>
      </section>

      <section class="instructions-section">
        <h2>Zubereitung</h2>
        <ol class="instructions-list">
          <li
            v-for="(instruction, index) in scaledRecipe.instructionTexts"
            :key="index"
            class="instruction-item"
          >
            {{ instruction }}
          </li>
        </ol>
      </section>
    </div>

    <section v-if="recipe.bakingInfo" class="baking-section">
      <h2>Backen</h2>
      <div class="oven-toggle">
        <button :class="{ active: selectedOven === OvenType.KITCHEN }" @click="selectedOven = OvenType.KITCHEN">
          Haushaltsofen
        </button>
        <button :class="{ active: selectedOven === OvenType.PIZZA }" @click="selectedOven = OvenType.PIZZA">
          Pizzaofen
        </button>
      </div>

      <div v-if="selectedOven === OvenType.KITCHEN" class="baking-details">
        <div class="baking-row">
          <span class="baking-label">Temperatur</span>
          <span class="baking-value">{{ recipe.bakingInfo.kitchenOven.temperatureCelsius }} °C</span>
        </div>
        <div class="baking-row">
          <span class="baking-label">Zeit</span>
          <span class="baking-value">{{ recipe.bakingInfo.kitchenOven.timeMinutes.min }}–{{ recipe.bakingInfo.kitchenOven.timeMinutes.max }} min</span>
        </div>
      </div>

      <div v-else class="baking-details">
        <div class="baking-row">
          <span class="baking-label">Oben</span>
          <span class="baking-value">{{ recipe.bakingInfo.pizzaOven.topTemperatureCelsius }} °C</span>
        </div>
        <div class="baking-row">
          <span class="baking-label">Unten</span>
          <span class="baking-value">{{ recipe.bakingInfo.pizzaOven.bottomTemperatureCelsius }} °C</span>
        </div>
        <div class="baking-row">
          <span class="baking-label">Zeit</span>
          <span class="baking-value">{{ recipe.bakingInfo.pizzaOven.timeMinutes.min }}–{{ recipe.bakingInfo.pizzaOven.timeMinutes.max }} min</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.recipe-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.recipe-header {
  margin-bottom: 3rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 2rem;
}

h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  color: #1f2937;
}

.description {
  margin: 0.5rem 0 1.5rem 0;
  font-size: 1.1rem;
  color: #6b7280;
}

.recipe-controls {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 600;
  color: #4b5563;
  font-size: 0.9rem;
}

.control-group input {
  padding: 0.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 1rem;
  width: 150px;
  transition: border-color 0.2s;
}

.control-group input:focus {
  outline: none;
  border-color: #d97706;
}

.recipe-meta {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.label {
  font-weight: 600;
  color: #4b5563;
}

.value {
  color: #6b7280;
  font-size: 1rem;
}

.recipe-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  color: #1f2937;
}

.ingredients-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ingredient-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.ingredient-item:last-child {
  border-bottom: none;
}

.ingredient-text {
  display: flex;
  gap: 1rem;
  align-items: baseline;
}

.ingredient-amount {
  font-weight: 600;
  color: #d97706;
  min-width: 80px;
  flex-shrink: 0;
}

.ingredient-name {
  color: #374151;
}

.ingredient-weight {
  margin-left: auto;
  color: #6b7280;
}

.instructions-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #374151;
}

.instruction-item {
  margin-bottom: 1rem;
  line-height: 1.6;
  padding-left: 0.5rem;
}

.instruction-item:last-child {
  margin-bottom: 0;
}

.baking-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

.oven-toggle {
  display: inline-flex;
  margin-bottom: 1.5rem;
}

.oven-toggle button {
  padding: 0.4rem 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 0;
  background: none;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.oven-toggle button:not(:first-child) {
  margin-left: -2px;
}

.oven-toggle button:first-child {
  border-radius: 0.375rem 0 0 0.375rem;
}

.oven-toggle button:last-child {
  border-radius: 0 0.375rem 0.375rem 0;
}

.oven-toggle button.active {
  background: #d97706;
  border-color: #d97706;
  color: #fff;
  z-index: 1;
}

.baking-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.baking-row {
  display: flex;
  gap: 1rem;
  align-items: baseline;
}

.baking-label {
  font-weight: 600;
  color: #4b5563;
  min-width: 100px;
}

.baking-value {
  font-weight: 600;
  color: #d97706;
}

@media (max-width: 768px) {
  .recipe-container {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .recipe-meta {
    flex-direction: column;
    gap: 1rem;
  }

  .recipe-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
