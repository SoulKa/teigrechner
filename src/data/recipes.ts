export enum OvenType {
  KITCHEN = 'kitchen',
  PIZZA = 'pizza',
}

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

  static readonly GRAMS = new Unit('g', 'Gramm', UnitKind.MASS, 1)
  static readonly MILLILITERS = new Unit('ml', 'Milliliter', UnitKind.VOLUME, 1)
  static readonly TEASPOON = new Unit('TL', 'Teelöffel', UnitKind.VOLUME, 5)
  static readonly TABLESPOON = new Unit('EL', 'Esslöffel', UnitKind.VOLUME, 15)
}

export class Ingredient {
  private static nextId = 1

  public readonly id = Ingredient.nextId++

  private constructor(
    public readonly name: string,

    /** Density in g/cm³. Optional; defaults to none */
    public readonly density: number = 0,
  ) {}

  static readonly PIZZA_FLOUR_00 = new Ingredient('Pizzamehl (Tipo 00)', 0.53)
  static readonly WATER = new Ingredient('Wasser', 0.997)
  static readonly FINE_GRAINED_SEA_SALT = new Ingredient('Feines Meersalz', 2.16)
  static readonly OLIVE_OIL = new Ingredient('Olivenöl', 0.915)
  static readonly FRESH_YEAST = new Ingredient('Frische Hefe', 0.95)
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
    return `${Math.round(this.amount * 10) / 10} ${this.unit.symbol}`
  }

  static sum(...quantities: Quantity[]): Quantity {
    return new Quantity(
      quantities.reduce((sum, q) => sum + q.getWeight().amount, 0),
      Unit.GRAMS,
    )
  }

  multiply(factor: number): Quantity {
    return new Quantity(this.amount * factor, this.unit)
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

  multiply(factor: number): IngredientQuantity {
    return new IngredientQuantity(this.ingredient, this.quantity.multiply(factor))
  }
}

type Instruction = string | ((recipe: Recipe) => string)

interface TimeRange {
  min: number
  max: number
}

interface OvenConfig {
  temperatureCelsius: number
  timeMinutes: TimeRange
}

interface PizzaOvenConfig {
  topTemperatureCelsius: number
  bottomTemperatureCelsius: number
  timeMinutes: TimeRange
}

export interface BakingInfo {
  kitchenOven: OvenConfig
  pizzaOven: PizzaOvenConfig
}

export class Recipe {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly ingredients: IngredientQuantity[],
    public readonly instructions: Instruction[],
    /** Diameter of the pizza in centimeters */
    public readonly diameter: number,
    /** Number of pizzas the recipe makes */
    public readonly portions: number,
    public readonly bakingInfo?: BakingInfo,
  ) {}

  get weight(): Quantity {
    return Quantity.sum(...this.ingredients.map((iq) => iq.weight))
  }

  get weightPerPizza(): Quantity {
    return this.weight.multiply(1 / this.portions)
  }

  get instructionTexts(): string[] {
    return this.instructions.map((instruction) =>
      typeof instruction === 'string' ? instruction : instruction(this),
    )
  }

  get flour(): IngredientQuantity {
    return this.getIngredient(Ingredient.PIZZA_FLOUR_00)
  }

  getIngredient(ingredient: Ingredient): IngredientQuantity {
    const iq = this.ingredients.find((iq) => iq.ingredient.id === ingredient.id)
    if (iq === undefined) {
      throw new Error(`Ingredient "${ingredient.name}" not found in recipe "${this.name}".`)
    }
    return iq
  }

  getIngredientQuantity(ingredient: Ingredient): Quantity {
    return this.getIngredient(ingredient).quantity
  }

  static readonly NEW_HAVEN = new Recipe(
    'New Haven-Style',
    'Ein klassischer New Haven-Style Pizzateig, bekannt für seine dünne, knusprige Kruste mit einem leicht knätschigem Biss.',
    [
      new IngredientQuantity(Ingredient.PIZZA_FLOUR_00, new Quantity(500, Unit.GRAMS)),
      new IngredientQuantity(Ingredient.WATER, new Quantity(300, Unit.MILLILITERS)),
      new IngredientQuantity(Ingredient.FINE_GRAINED_SEA_SALT, new Quantity(15, Unit.GRAMS)),
      new IngredientQuantity(Ingredient.OLIVE_OIL, new Quantity(15, Unit.GRAMS)),
      new IngredientQuantity(Ingredient.FRESH_YEAST, new Quantity(1, Unit.GRAMS)),
    ],
    [
      'Das Mehl in eine große Schüssel geben.',
      'Gut die Hälfte des Wassers hinzufügen, die Hefe reinbröseln und mit den Händen unterkneten.',
      'Nach und nach das restliche Wasser hinzufügen und weiterkneten, bis der Teig nicht mehr klebt (das kann schonmal 15min dauern).',
      (recipe) =>
        `Das Salz (${recipe.getIngredientQuantity(Ingredient.FINE_GRAINED_SEA_SALT)}) hinzufügen und weiterkneten, bis es vollständig eingearbeitet ist. Der Teig sollte danach weich und elastisch sein.`,
      (recipe) =>
        `Das Olivenöl (${recipe.getIngredientQuantity(Ingredient.OLIVE_OIL)}) hinzufügen und erneut kneten, bis es vollständig eingearbeitet ist.`,
      'Den Teig zu einer Kugel formen, auf die Arbeitsfläche legen und mit der Schüssel abdecken.',
      '10min ruhen lassen.',
      (recipe) =>
        `Den Teig in ${recipe.portions} gleich große Portionen (je ca. ${recipe.weightPerPizza}) teilen.`,
      'Jede Portion zu einer strammen Kugel schleifen und in eine Luftdichte Box legen. Im Kühlschrank 18-24h reifen lassen.',
      'Vor dem Ausrollen den Teig 3-4h bei Raumtemperatur akklimatisieren lassen.',
    ],
    28,
    4,
    {
      kitchenOven: { temperatureCelsius: 250, timeMinutes: { min: 8, max: 12 } },
      pizzaOven: {
        topTemperatureCelsius: 420,
        bottomTemperatureCelsius: 370,
        timeMinutes: { min: 3, max: 5 },
      },
    },
  )

  static readonly NEAPOLITAN = new Recipe(
    'Neapolitanisch',
    'Der Klassiker und Weltkulturerbe: Neapolitanischer Pizzateig mit einer weichen, luftigen Kruste und einem zarten Biss.',
    [
      new IngredientQuantity(Ingredient.PIZZA_FLOUR_00, new Quantity(500, Unit.GRAMS)),
      new IngredientQuantity(Ingredient.WATER, new Quantity(325, Unit.MILLILITERS)),
      new IngredientQuantity(Ingredient.FINE_GRAINED_SEA_SALT, new Quantity(15, Unit.GRAMS)),
      new IngredientQuantity(Ingredient.OLIVE_OIL, new Quantity(15, Unit.GRAMS)),
      new IngredientQuantity(Ingredient.FRESH_YEAST, new Quantity(1.5, Unit.GRAMS)),
    ],
    [
      'Das Mehl in eine große Schüssel geben.',
      (recipe) =>
        `Ca 90% des Wassers (${recipe.getIngredientQuantity(Ingredient.WATER).multiply(0.9)}) hinzufügen und mit einem Löffel vermischen.`,
      'Den Teig mit einem Handtuch abgedeckt 30min autolysieren lassen.',
      'Die Hefe im restlichen Wasser auflösen und zum Teig geben. Mit den Händen unterkneten bis das Wasser vollständig aufgenommen ist.',
      (recipe) =>
        `Die ${recipe.getIngredientQuantity(Ingredient.FINE_GRAINED_SEA_SALT)} Salz hinzufügen und weiterkneten bis es eingearbeitet ist.`,
      'Den Teig auf die Arbeitsfläche geben und 15-20min weiterkneten, bis er glatt und elastisch ist.',
      'Jetzt den Teig dehnen und falten, anschließend zu einer Kugel schleifen. Noch einmal 15min bei Zimmertemperatur ruhen lassen.',
      'Den Teig für 24h zur Stockgare in den Kühlschrank stellen.',
      (recipe) =>
        `Den Teig in ${recipe.portions} gleich große Portionen (je ca. ${recipe.weightPerPizza}) teilen.`,
      'Jede Portion zu einer strammen Kugel schleifen und in eine Luftdichte Box legen. Im Kühlschrank noch einmal 20h reifen lassen.',
      'Vor dem Ausrollen den Teig 3-4h bei Raumtemperatur akklimatisieren lassen.',
    ],
    31,
    3,
    {
      kitchenOven: { temperatureCelsius: 250, timeMinutes: { min: 8, max: 10 } },
      pizzaOven: {
        topTemperatureCelsius: 450,
        bottomTemperatureCelsius: 400,
        timeMinutes: { min: 1, max: 2 },
      },
    },
  )

  static readonly FLAMMKUCHEN = new Recipe(
    'Flammkuchen',
    'Ein elsässischer Klassiker: dünner, knuspriger Teig ohne Hefe - schnell gemacht und perfekt für Crème fraîche, Speck und Zwiebeln.',
    [
      new IngredientQuantity(Ingredient.PIZZA_FLOUR_00, new Quantity(250, Unit.GRAMS)),
      new IngredientQuantity(Ingredient.WATER, new Quantity(120, Unit.GRAMS)),
      new IngredientQuantity(Ingredient.OLIVE_OIL, new Quantity(30, Unit.GRAMS)),
      new IngredientQuantity(Ingredient.FINE_GRAINED_SEA_SALT, new Quantity(0.25, Unit.TEASPOON)),
    ],
    [
      'Alle Zutaten in eine Schüssel geben.',
      'Kneten, bis ein glatter, geschmeidiger Teig entsteht.',
      'Den Teig in Frischhaltefolie wickeln und 30 Minuten im Kühlschrank ruhen lassen.',
      (recipe) =>
        `Den Teig in ${recipe.portions} gleich große Portionen (je ca. ${recipe.weightPerPizza}) teilen und auf einer bemehlten Arbeitsfläche sehr dünn ausrollen.`,
    ],
    28,
    2,
    {
      kitchenOven: { temperatureCelsius: 250, timeMinutes: { min: 20, max: 25 } },
      pizzaOven: {
        topTemperatureCelsius: 350,
        bottomTemperatureCelsius: 300,
        timeMinutes: { min: 4, max: 6 },
      },
    },
  )
}

export class RecipeScaler {
  /**
   * Scales a recipe based on pizza size and count.
   * Scaling factor is based on area (proportional to diameter squared) and count.
   */
  static scale(recipe: Recipe, targetDiameter: number, targetPortions: number): Recipe {
    // Calculate area ratio: (targetSize² * targetCount) / (baseSize² * baseCount)
    const baseArea = Math.PI * Math.pow(recipe.diameter / 2, 2)
    const targetArea = Math.PI * Math.pow(targetDiameter / 2, 2)
    const scaleFactor = (targetArea * targetPortions) / (baseArea * recipe.portions)

    return new Recipe(
      recipe.name,
      recipe.description,
      recipe.ingredients.map((iq) => iq.multiply(scaleFactor)),
      recipe.instructions,
      targetDiameter,
      targetPortions,
      recipe.bakingInfo,
    )
  }
}
