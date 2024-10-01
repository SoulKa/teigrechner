// Ingredient base amounts for a standard pizza of 30 cm
const baseFlour = 110; // grams of flour for a 30 cm pizza
const baseWater = 60; // ml of water
const baseYeast = 7; // grams of yeast
const baseSalt = 2; // grams of salt
const baseOil = 1; // TS of oil
const baseArea = Math.PI * Math.pow(28 / 2, 2); // area of a 28 cm pizza
const baseDough = 180; // grams of dough for a 28 cm pizza

const BEERS = ["Wulle", "Franziskaner", "Guiness", "Krombacher",
  "Stuttgarter Herrenpils", "Störtebecker", "Farny", "Spaten Bier",
  "Chiemseer Helles", "Benediktiner", "Freiberger"];

function init() {
  // Set default values for input fields
  document.getElementById('pizza-diameter').value = 28;
  document.getElementById('pizza-amount').value = 1;
  document.getElementById('flour').value = baseFlour;
  document.getElementById('water').value = baseWater;
  document.getElementById('yeast').value = baseYeast;
  document.getElementById('salt').value = baseSalt;
  document.getElementById('oil').value = baseOil;
  document.getElementById('dough').textContent = baseDough + "g";

  // Add event listeners to input fields
  document.getElementById('pizza-diameter').addEventListener('input',
      calculateIngredients);
  document.getElementById('pizza-amount').addEventListener('input',
      calculateIngredients);

  // Calculate initial ingredient amounts
  calculateIngredients();

  // Set random beer name
  document.getElementById('beer').textContent = getRandomBeer();
}

/**
 * Sets the number of pizza slices to be displayed
 * @param {number} numPizza The number of full pizza
 */
function setNumberOfSlices(numPizza) {
  const numSlices = Math.min(250, Math.round(numPizza * 8));
  const pizzaContainer = document.getElementById('pizza-container');

  // Remove extra slices
  while (pizzaContainer.children.length > numSlices) {
    pizzaContainer.children.item(0)?.remove();
  }

  // Add missing slices
  for (let i = pizzaContainer.children.length; i < numSlices; i++) {
    createPizzaSlice();
  }
}

/**
 * Function to calculate the ingredient amounts based on the pizza diameter and amount
 */
function calculateIngredients() {
  const diameter = document.getElementById('pizza-diameter').value;
  const amount = document.getElementById('pizza-amount').value;

  // Calculate area of the pizza
  const currentArea = Math.PI * Math.pow(diameter / 2, 2); // area of the current pizza

  // Calculate scaling factor based on area
  const scaleFactor = (currentArea / baseArea) * amount;

  // Calculate ingredient amounts
  document.getElementById('flour').value = Math.round(baseFlour * scaleFactor);
  document.getElementById('water').value = Math.round(baseWater * scaleFactor);
  document.getElementById('yeast').value = Math.round(baseYeast * scaleFactor);
  document.getElementById('salt').value = (baseSalt * scaleFactor).toFixed(1);
  document.getElementById('oil').value = (baseOil * scaleFactor).toFixed(1);
  document.getElementById('dough').textContent = Math.round(
      baseDough * currentArea / baseArea) + "g";

  setNumberOfSlices(amount);
}

/**
 * Function to get a random number between a range
 * @param {number} min the minimum number
 * @param {number} max the maximum number
 */
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomBeer() {
  return BEERS[Math.floor(Math.random() * BEERS.length)];
}

/**
 * Creates a new pizza slice element
 */
function createPizzaSlice() {
  // Create a new pizza element
  const pizza = document.createElement('div');
  pizza.classList.add('pizza');
  pizza.innerHTML = '&#127829;'; // Pizza emoji 🍕

  // Randomize the size, position, and animation speed
  const size = getRandom(20, 80); // Random size between 20px and 80px
  const positionX = getRandom(0, window.innerWidth - size); // Random horizontal position
  const duration = getRandom(5, 15); // Random falling duration between 5s and 15s
  const delay = getRandom(0, 5); // Random delay before the pizza starts falling

  // Apply styles to the pizza
  pizza.style.left = `${positionX}px`;
  pizza.style.fontSize = `${size}px`;
  pizza.style.animationDuration = `${duration}s`;
  pizza.style.animationDelay = `${delay}s`;
  pizza.style.transform = `rotate(${getRandom(0, 360)}deg)`;

  // Append the pizza to the container
  document.getElementById('pizza-container').appendChild(pizza);

  // Remove the pizza after the animation is complete
  pizza.addEventListener('animationend', () => pizza.remove());

  // Add click event listener for explosion
  pizza.addEventListener('click', (e) => explodePizza(pizza, e.pageX, e.pageY));
}

/**
 * @param x {number} X position
 * @param y {number} Y position
 */
function explode(x, y) {
  const particles = 150;
  const explosion = document.createElement('div');
  explosion.classList.add('explosion');

  // put the explosion container into the body to be able to get it's size
  document.querySelector('body').append(explosion);

  // position the container to be centered on click
  explosion.style.left = (x - explosion.offsetWidth / 2) + "px";
  explosion.style.top = (y - explosion.offsetHeight / 2) + "px";

  for (let i = 0; i < particles; i++) {
    // positioning x,y of the particle on the circle (little randomized radius)
    const x = (explosion.offsetWidth / 2) + getRandom(80, 150) * Math.cos(
        2 * Math.PI * i / getRandom(particles - 10, particles + 10));
    const y = (explosion.offsetHeight / 2) + getRandom(80, 150) * Math.sin(
        2 * Math.PI * i / getRandom(particles - 10, particles + 10));

    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.backgroundColor = `rgb(${getRandom(0, 255)},0,0)`;
    particle.style.top = y + 'px';
    particle.style.left = x + 'px';

    if (i === 0) {
      particle.onanimationend = () => explosion.remove();
    }
    explosion.append(particle);
  }
}

/**
 * Explodes a pizza slice
 * @param {HTMLDivElement} pizza The pizza slice element
 * @param {number} x The x position of the explosion
 * @param {number} y The y position of the explosion
 */
function explodePizza(pizza, x, y) {
  pizza.remove();
  createPizzaSlice();
  explode(x, y);
}