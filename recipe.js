export const Unit = Object.freeze({
  GRAM: "g",
  MILLILITER: "ml",
  TEASPOON: "tsp",
  TABLESPOON: "tbsp",
  PIECE: "pc",
});

export class Ingredient {
  /**
   * @param {string} name The name of the ingredient
   * @param {number} amount The amount of the ingredient
   * @param unit The unit of the ingredient (default: Unit.PIECE)
   */
  constructor(name, amount, unit = Unit.PIECE) {
    this.name = name;
    this.amount = amount;
    this.unit = unit;
  }

  toString() {
    return `${this.amount} ${this.unit} ${this.name}`;
  }
}

export class Recipe {
  /**
   * @param {string} name The name of the recipe
   * @param {string} description The description of the recipe
   * @param {Ingredient[]} ingredients The ingredients of the recipe
   */
  constructor(name, description, ingredients = []) {
    this.name = name;
    this.description = description;
    this.ingredients = ingredients;
  }
}
