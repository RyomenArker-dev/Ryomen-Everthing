// Optional entrance animations, made with Motion (formerly Framer Motion), MIT licence.
// Motion's plain-JS build is in vendor/. It needs no React and no build step.
// The page works fine without this file: delete both <script> tags to turn animations off.
// If the visitor asks for reduced motion, nothing moves and nothing is hidden.
(function () {
  var M = window.Motion;
  if (!M || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var ease = [0.22, 1, 0.36, 1]; // soft ease-out

  // Hero: plays once when the page loads.
  var hero = document.querySelectorAll(".hero-inner > *");
  if (hero.length) {
    M.animate(hero, { opacity: [0, 1], y: [16, 0] },
      { duration: 0.6, delay: M.stagger(0.08), ease: ease });
  }

  // Sections: each group fades up the first time it scrolls into view.
  var groups = [".section h2", ".cards", ".steps", ".section .narrow > p"];
  groups.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      var items = el.matches(".cards, .steps") ? el.children : [el];
      M.animate(items, { opacity: 0 }, { duration: 0 }); // hide only once JS has run
      M.inView(el, function () {
        M.animate(items, { opacity: [0, 1], y: [24, 0] },
          { duration: 0.5, delay: M.stagger(0.08), ease: ease });
      }, { amount: 0.2 });
    });
  });
})();
