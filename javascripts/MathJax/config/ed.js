MathJax.Hub.Config({
  skipStartupTypeset: true,
  showMathMenu: false,
  jax: ["input/TeX", "output/SVG"],
  extensions: ["tex2jax.js"],
  tex2jax: { inlineMath: [], displayMath: [] },
  "SVG": { blacker: 1, font: 'TeX' },
});
MathJax.Hub.processUpdateTime = 1024;
MathJax.Hub.processUpdateDelay = 64;
MathJax.Hub.Startup.MenuZoom = function () {};
