export enum UnitKind {
  MASS = 'mass',
  VOLUME = 'volume',
}

export class Unit {
  constructor(
    public readonly symbol: string,
    public readonly name: string,
    public readonly kind: UnitKind,

    // Converts to base unit (g for mass, ml for volume)
    public readonly toBaseFactor: number,
  ) {}

  static readonly GRAMS = new Unit('g', 'grams', UnitKind.MASS, 1)
  static readonly MILLILITERS = new Unit('ml', 'milliliters', UnitKind.VOLUME, 1)
  static readonly TEASPOON = new Unit('tsp', 'teaspoon', UnitKind.VOLUME, 5)
  static readonly TABLESPOON = new Unit('tbsp', 'tablespoon', UnitKind.VOLUME, 15)
}

export class Ingredient {
  constructor(
    public readonly name: string,

    // Density in g/cm³. Optional; defaults to none
    public readonly density: number = 0,
  ) {}

  static readonly PIZZA_FLOUR_00 = new Ingredient('Pizza flour 00', 0.53)
  static readonly WATER = new Ingredient('Water', 0.997)
  static readonly SEA_SALT = new Ingredient('Sea salt', 2.16)
  static readonly OLIVE_OIL = new Ingredient('Olive oil', 0.915)
}

export class Quantity {
  constructor(
    public readonly amount: number,
    public readonly unit: Unit,
  ) {}

  getWeight(density?: number): Quantity {
    if (this.unit.kind === UnitKind.MASS) return this

    if (!density) throw new Error('Density is required to convert volume to weight.')
    return new Quantity(this.amount * this.unit.toBaseFactor * density, Unit.GRAMS)
  }

  toString(): string {
    return `${this.amount} ${this.unit.symbol}`
  }

  static sum(quantities: Quantity[]): Quantity {
    return new Quantity(
      quantities.reduce((sum, q) => sum + q.getWeight().amount, 0),
      Unit.GRAMS,
    )
  }
}

export class IngredientQuantity {
  constructor(
    public readonly ingredient: Ingredient,
    public readonly quantity: Quantity,
  ) {}

  get weight(): Quantity {
    return this.quantity.getWeight(this.ingredient.density)
  }

  toString(): string {
    return `${this.quantity} ${this.ingredient.name}`
  }
}

export class Recipe {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly ingredients: IngredientQuantity[],
    public readonly instructions: string[],
    public readonly basePizzaSize: number, // in cm diameter
    public readonly basePizzaCount: number,
  ) {}

  get weight(): Quantity {
    return Quantity.sum(this.ingredients.map((iq) => iq.weight))
  }

  static readonly NEW_HAVEN = new Recipe(
    'New Haven-Style',
    'A classic New Haven-style pizza dough recipe known for its thin, crispy crust and slight chewiness.',
    [
      new IngredientQuantity(Ingredient.PIZZA_FLOUR_00, new Quantity(500, Unit.GRAMS)),
      new IngredientQuantity(Ingredient.WATER, new Quantity(300, Unit.MILLILITERS)),
      new IngredientQuantity(Ingredient.SEA_SALT, new Quantity(15, Unit.GRAMS)),
      new IngredientQuantity(Ingredient.OLIVE_OIL, new Quantity(15, Unit.GRAMS)),
    ],
    [
      'In a large mixing bowl, combine the pizza flour and sea salt.',
      'Gradually add the water while mixing, until a shaggy dough forms.',
      'Add the olive oil and knead the dough on a floured surface for about 10 minutes, until smooth and elastic.',
      'Place the dough in a lightly oiled bowl, cover with a damp cloth, and let it rise at room temperature for 1-2 hours, or until doubled in size.',
      'Preheat your oven to its highest setting (usually around 250°C or 482°F) with a pizza stone or baking sheet inside.',
      'Divide the dough into portions, shape each into a ball, and let them rest for 15 minutes.',
      'Roll out each dough ball on a floured surface to your desired thickness.',
      'Add your favorite toppings and bake on the preheated stone or baking sheet for 7-10 minutes, or until the crust is golden and crispy.',
      'Remove from the oven, slice, and enjoy your New Haven-style pizza!',
    ],
    28, // base pizza size in cm
    3, // base pizza count
  )
}

export class RecipeScaler {
  /**
   * Scales a recipe based on pizza size and count.
   * Scaling factor is based on area (proportional to diameter squared) and count.
   */
  static scale(recipe: Recipe, targetPizzaSize: number, targetPizzaCount: number): Recipe {
    // Calculate area ratio: (targetSize² * targetCount) / (baseSize² * baseCount)
    const baseArea = Math.PI * Math.pow(recipe.basePizzaSize / 2, 2)
    const targetArea = Math.PI * Math.pow(targetPizzaSize / 2, 2)
    const scaleFactor = (targetArea * targetPizzaCount) / (baseArea * recipe.basePizzaCount)

    // Scale all ingredients
    const scaledIngredients = recipe.ingredients.map(
      (iq) =>
        new IngredientQuantity(
          iq.ingredient,
          new Quantity(Math.round(iq.quantity.amount * scaleFactor * 10) / 10, iq.quantity.unit),
        ),
    )

    return new Recipe(
      recipe.name,
      recipe.description,
      scaledIngredients,
      recipe.instructions,
      targetPizzaSize,
      targetPizzaCount,
    )
  }
}
