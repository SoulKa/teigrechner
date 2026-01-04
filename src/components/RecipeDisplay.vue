<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Recipe, RecipeScaler } from '@/data/recipes'
import PizzaSnow from './PizzaSnow.vue'

const props = defineProps<{
  recipe: Recipe
}>()

const pizzaSize = ref(props.recipe.diameter)
const pizzaCount = ref(props.recipe.portions)
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
          <label for="pizza-size">Pizza Size (cm)</label>
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
          <label for="pizza-count">Number of Pizzas</label>
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
        <h2>Ingredients</h2>
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
        <h2>Instructions</h2>
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
