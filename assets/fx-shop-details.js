/*
 * FloorX Shop Details — tab switcher (How to Use / Benefits / Description)
 */
(function FXShopDetails() {
  'use strict';

  function boot() {
    var roots = document.querySelectorAll('[data-fx-shop-details]');
    if (!roots.length) return;
    roots.forEach(init);
  }

  function init(root) {
    if (root.__fxSdReady) return;
    root.__fxSdReady = true;

    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-fx-sd-tab]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-fx-sd-panel]'));
    if (!tabs.length || !panels.length) return;

    function activate(key, focusTab) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute('data-fx-sd-tab') === key;
        tab.classList.toggle('is-active', on);
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        if (on && focusTab) tab.focus();
      });

      panels.forEach(function (panel) {
        var on = panel.getAttribute('data-fx-sd-panel') === key;
        panel.classList.toggle('is-active', on);
        if (on) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      });

      root.setAttribute('data-active-tab', key);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activate(tab.getAttribute('data-fx-sd-tab'), false);
      });

      tab.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(tab);
        var next = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next < 0) return;
        e.preventDefault();
        activate(tabs[next].getAttribute('data-fx-sd-tab'), true);
      });
    });

    /* Deep-link: #fx-shop-details?tab=howto or #howto — default: How to Use */
    var hash = (window.location.hash || '').toLowerCase();
    if (hash.indexOf('benefit') !== -1) activate('benefits', false);
    else if (hash.indexOf('description') !== -1 || hash.indexOf('desc') !== -1) activate('description', false);
    else if (hash.indexOf('howto') !== -1 || hash.indexOf('how-to') !== -1) activate('howto', false);
    else activate('howto', false);

    /* "View full details" from shop panel */
    document.querySelectorAll('[data-fx-open-details]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var tab = el.getAttribute('data-fx-open-details') || 'howto';
        activate(tab, false);
        root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
