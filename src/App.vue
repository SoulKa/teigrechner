<script setup lang="ts">
import RecipeDisplay from './components/RecipeDisplay.vue'
import { Recipe } from './data/recipes'
</script>

<template>
  <div id="app">
    <RecipeDisplay :recipe="Recipe.NEW_HAVEN" />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
}
</style>
