<script setup lang="ts">
import { Recipe } from '@/data/recipes'

defineProps<{
  recipe: Recipe
}>()
</script>

<template>
  <div class="recipe-container">
    <div class="recipe-header">
      <h1>{{ recipe.name }}</h1>
      <p class="description">{{ recipe.description }}</p>
    </div>

    <div class="recipe-content">
      <section class="ingredients-section">
        <h2>Ingredients</h2>
        <ul class="ingredients-list">
          <li v-for="(entry, index) in recipe.ingredients" :key="index" class="ingredient-item">
            <div class="ingredient-text">
              <span class="ingredient-amount"
                >{{ entry.quantity.amount }} {{ entry.quantity.unit.symbol }}</span
              >
              <span class="ingredient-name">{{ entry.ingredient.name }}</span>
            </div>
            <span class="ingredient-quantity">≈{{ entry.quantity }}</span>
          </li>
        </ul>
      </section>

      <section class="instructions-section">
        <h2>Instructions</h2>
        <ol class="instructions-list">
          <li
            v-for="(instruction, index) in recipe.instructions"
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
