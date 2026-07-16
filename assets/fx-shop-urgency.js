/*
 * FloorX Shop Urgency — animated live checkout count
 */
(function FXShopUrgency() {
  'use strict';

  function boot() {
    document.querySelectorAll('[data-fx-urgency]').forEach(init);
  }

  function init(root) {
    if (root.__fxUrgencyReady) return;
    root.__fxUrgencyReady = true;

    var el = root.querySelector('[data-fx-urgency-count]');
    if (!el) return;

    var min = parseInt(root.getAttribute('data-min'), 10) || 8;
    var max = parseInt(root.getAttribute('data-max'), 10) || 16;
    var speed = (parseInt(root.getAttribute('data-speed'), 10) || 4) * 1000;
    if (max < min) max = min;

    function tick() {
      var n = min + Math.floor(Math.random() * (max - min + 1));
      el.textContent = String(n);
    }

    tick();
    setInterval(tick, speed);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
