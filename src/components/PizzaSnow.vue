<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  pizzaCount: number
  emoji?: string
  enabled?: boolean
}>()

interface Snowflake {
  id: number
  left: number
  top: number
  animationDuration: number
  fontSize: number
  opacity: number
  rotation: number
  emoji: string
  flipping: boolean
}

interface Particle {
  id: number
  x: number
  y: number
  angle: number
  distance: number
  size: number
  color: string
}

const snowflakes = ref<Snowflake[]>([])
const particles = ref<Particle[]>([])
let nextId = 0
let intervalId: number | undefined

const createSnowflake = () => {
  if (props.enabled === false) return
  if (snowflakes.value.length >= props.pizzaCount * 8) {
    return
  }

  const snowflake: Snowflake = {
    id: nextId++,
    left: Math.random() * 100,
    top: -50,
    animationDuration: 5 + Math.random() * 10, // 5-15 seconds
    fontSize: 20 + Math.random() * 30, // 20-50px
    opacity: 0.6 + Math.random() * 0.4, // 0.6-1.0
    rotation: Math.random() * 360,
    emoji: props.emoji ?? '🍕',
    flipping: false,
  }
  snowflakes.value.push(snowflake)

  // Remove snowflake after animation completes
  setTimeout(() => {
    const index = snowflakes.value.findIndex((s) => s.id === snowflake.id)
    if (index > -1) {
      snowflakes.value.splice(index, 1)
    }
  }, snowflake.animationDuration * 1000)
}

const FLIP_DURATION = 400

watch(
  () => props.emoji,
  (newEmoji) => {
    snowflakes.value.forEach((s) => { s.flipping = true })
    setTimeout(() => {
      snowflakes.value.forEach((s) => { s.emoji = newEmoji ?? '🍕' })
    }, FLIP_DURATION / 2)
    setTimeout(() => {
      snowflakes.value.forEach((s) => { s.flipping = false })
    }, FLIP_DURATION)
  },
)

onMounted(() => {
  // Create snowflakes every 300ms
  intervalId = window.setInterval(createSnowflake, 300)
})

onUnmounted(() => {
  clearInterval(intervalId)
  intervalId = undefined
})

const explodePizza = (event: MouseEvent, snowflake: Snowflake) => {
  // Get click position
  const x = event.clientX
  const y = event.clientY

  // Remove pizza immediately
  const index = snowflakes.value.findIndex((s) => s.id === snowflake.id)
  if (index > -1) {
    snowflakes.value.splice(index, 1)
  }

  // Create particles
  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#00d2d3']
  const particleCount = 45 + Math.floor(Math.random() * 55) // 45-100 particles

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5
    const particle: Particle = {
      id: nextId++,
      x,
      y,
      angle,
      distance: 80 + Math.random() * 60, // 80-140px distance
      size: 4 + Math.random() * 6, // 4-10px
      color: colors[Math.floor(Math.random() * colors.length)]!,
    }
    particles.value.push(particle)
  }

  // Remove particles after animation
  setTimeout(() => {
    particles.value = particles.value.filter((p) => p.id < nextId - particleCount)
  }, 800)
}
</script>

<template>
  <div class="pizza-snow">
    <div
      v-for="snowflake in snowflakes"
      :key="snowflake.id"
      class="pizza"
      :style="{
        left: `${snowflake.left}%`,
        animationDuration: `${snowflake.animationDuration}s`,
        fontSize: `${snowflake.fontSize}px`,
        opacity: snowflake.opacity,
        transform: `rotate(${snowflake.rotation}deg)`,
      }"
      @click="(e) => explodePizza(e, snowflake)"
    >
      <span class="emoji" :class="{ flipping: snowflake.flipping }">{{ snowflake.emoji }}</span>
    </div>
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="particle"
      :style="{
        left: `${particle.x}px`,
        top: `${particle.y}px`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        backgroundColor: particle.color,
        '--angle': `${particle.angle}rad`,
        '--distance': `${particle.distance}px`,
      }"
    />
  </div>
</template>

<style scoped>
.pizza-snow {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 9999;
  pointer-events: none;
}

.pizza {
  position: absolute;
  top: -50px;
  animation: fall linear forwards;
  user-select: none;
  cursor: pointer;
  pointer-events: auto;
  transition: filter 0.1s;
}

.pizza:hover {
  filter: brightness(1.2);
}

.emoji {
  display: inline-block;
}

.emoji.flipping {
  animation: emoji-flip v-bind('FLIP_DURATION + "ms"') linear forwards;
}

@keyframes emoji-flip {
  0%   { transform: scaleX(1); }
  40%  { transform: scaleX(0); }
  60%  { transform: scaleX(0); }
  100% { transform: scaleX(1); }
}

.particle {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  animation: burst 0.8s ease-out forwards;
}

@keyframes fall {
  to {
    transform: translateY(100vh) rotate(720deg);
  }
}

@keyframes burst {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(
        calc(cos(var(--angle)) * var(--distance)),
        calc(sin(var(--angle)) * var(--distance))
      )
      scale(0);
    opacity: 0;
  }
}
</style>
