/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2024 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */

const getStoredTheme = () => localStorage.getItem('theme')
const setStoredTheme = theme => localStorage.setItem('theme', theme)

function getPreferredTheme() {
  const storedTheme = getStoredTheme()
  if (storedTheme) {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark'
      : 'light'
}

function setTheme(theme) {
  if (theme === 'auto') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark'
        : 'light';
  }
  document.documentElement.setAttribute('data-bs-theme', theme);

  if (theme === 'light') {
    document.body.classList.remove('bg-dark');
  } else {
    document.body.classList.add('bg-dark');
  }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',
    () => {
      const storedTheme = getStoredTheme()
      if (storedTheme !== 'light' && storedTheme !== 'dark') {
        setTheme(getPreferredTheme())
      }
    });

/**
 * Switches between light and dark mode color scheme
 */
function toggleColorScheme() {
  // Mirrors the pizza icon when toggling color mode scheme
  document.getElementById("pizza-image").classList.toggle("flip-x");
  const theme = document.documentElement.getAttribute(
      'data-bs-theme') === 'light' ? 'dark' : 'light';
  setStoredTheme(theme);
  setTheme(theme);
}
