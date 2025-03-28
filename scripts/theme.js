// Theme detection and handling
document.addEventListener('DOMContentLoaded', () => {
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Apply initial theme based on system preference
  applyTheme(prefersDarkScheme.matches);

  // Listen for system preference changes
  prefersDarkScheme.addEventListener("change", (e) => {
    applyTheme(e.matches);
  });

  // Helper function to apply theme
  function applyTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('light-theme', !isDark);
  }
});