/*
 * FloorX FAQ Stage
 * Desktop: questions list + shared answer panel
 * Mobile: accordion expand/collapse with smooth height animation
 */
(function FXFaqStage() {
  'use strict';

  function bootAll() {
    var roots = document.querySelectorAll('[data-fx-faq-stage]');
    if (!roots.length) return;
    roots.forEach(bootOne);
  }

  function bootOne(root) {
    if (root.__fxFaqReady) return;
    root.__fxFaqReady = true;

    var items = Array.prototype.slice.call(root.querySelectorAll('.fx-faq-stage__qitem'));
    var qBtns = Array.prototype.slice.call(root.querySelectorAll('[data-fx-faq-q]'));
    var titleEl = root.querySelector('[data-fx-faq-title]');
    var bodyEl = root.querySelector('[data-fx-faq-body]');
    var answerPanel = root.querySelector('[data-fx-faq-answer]');
    var mq = window.matchMedia('(max-width: 989px)');

    function isNarrow() {
      return mq.matches;
    }

    function setExpanded(item, open) {
      var btn = item.querySelector('[data-fx-faq-q]');
      var panel = item.querySelector('.fx-faq-stage__expand');
      item.classList.toggle('is-open', open);
      item.classList.toggle('is-active', open);
      if (btn) {
        btn.classList.toggle('is-active', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      /* Don't toggle [hidden] during collapse — it kills CSS height animation */
      if (panel) {
        panel.setAttribute('aria-hidden', open ? 'false' : 'true');
        panel.removeAttribute('hidden');
      }
    }

    function syncDesktopAnswer(btn) {
      if (!btn) return;
      if (titleEl) {
        var label = btn.querySelector('.fx-faq-stage__qlabel');
        titleEl.textContent =
          btn.getAttribute('data-title') ||
          (label ? label.textContent.trim() : '') ||
          btn.textContent.trim();
      }
      if (bodyEl) bodyEl.textContent = btn.getAttribute('data-answer') || '';
    }

    function activateDesktop(btn) {
      qBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        var item = b.closest('.fx-faq-stage__qitem');
        if (item) {
          item.classList.toggle('is-active', on);
          /* desktop keeps all expand panels closed visually via CSS; state still ok */
          setExpanded(item, false);
        }
      });
      /* mark active item without expanding accordion on desktop */
      var activeItem = btn.closest('.fx-faq-stage__qitem');
      if (activeItem) {
        activeItem.classList.add('is-active');
        btn.classList.add('is-active');
      }
      syncDesktopAnswer(btn);
    }

    function toggleMobile(btn) {
      var item = btn.closest('.fx-faq-stage__qitem');
      if (!item) return;
      var wasOpen = item.classList.contains('is-open');

      items.forEach(function (it) {
        setExpanded(it, false);
      });

      if (!wasOpen) {
        setExpanded(item, true);
        /* gentle scroll so expanded card stays in view */
        requestAnimationFrame(function () {
          var rect = item.getBoundingClientRect();
          if (rect.top < 72 || rect.bottom > window.innerHeight - 24) {
            var top = rect.top + window.scrollY - 80;
            window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
          }
        });
      }
    }

    function onClick(btn) {
      if (isNarrow()) toggleMobile(btn);
      else activateDesktop(btn);
    }

    qBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        onClick(btn);
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(btn);
        }
      });
    });

    function onViewportChange() {
      if (isNarrow()) {
        /* ensure only first open or none conflict */
        var open = root.querySelector('.fx-faq-stage__qitem.is-open');
        if (!open && items[0]) setExpanded(items[0], true);
      } else {
        items.forEach(function (it) {
          setExpanded(it, false);
        });
        var activeBtn = root.querySelector('.fx-faq-stage__qbtn.is-active') || qBtns[0];
        if (activeBtn) activateDesktop(activeBtn);
      }
    }

    if (mq.addEventListener) mq.addEventListener('change', onViewportChange);
    else if (mq.addListener) mq.addListener(onViewportChange);

    /* Initial state */
    if (isNarrow()) {
      items.forEach(function (it, i) {
        setExpanded(it, i === 0);
      });
    } else if (qBtns[0]) {
      activateDesktop(qBtns[0]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAll);
  } else {
    bootAll();
  }
})();
