/*
 * FloorX Shop Product UI
 * Size cards + thumbs + Shopify cart AJAX
 * Size keys: "6 KG" | "1.5 KG"
 */
(function FXShop() {
  'use strict';

  function boot() {
    var roots = document.querySelectorAll('[data-fx-shop]');
    if (!roots.length) return;
    roots.forEach(initShop);
  }

  function canonicalSize(btn) {
    if (!btn) return '6 KG';
    var ds = btn.getAttribute('data-size');
    if (ds) {
      var n = String(ds).toLowerCase();
      if (n.indexOf('1.5') !== -1 || n.indexOf('1_5') !== -1) return '1.5 KG';
      if (n.indexOf('6') !== -1) return '6 KG';
    }
    var t = String(btn.getAttribute('data-title') || btn.textContent || '').toLowerCase();
    if (t.indexOf('1.5') !== -1 || t.indexOf('1,5') !== -1) return '1.5 KG';
    if (t.indexOf('6') !== -1) return '6 KG';
    return '6 KG';
  }

  function routes() {
    return window.routes || {};
  }

  function cartEl() {
    return document.querySelector('cart-drawer') || document.querySelector('cart-notification');
  }

  function setButtonLabel(btn, label) {
    if (!btn) return;
    var span = btn.querySelector('[data-fx-add-label]');
    if (span) {
      span.textContent = label;
      return;
    }
    var textNode = null;
    for (var n = 0; n < btn.childNodes.length; n++) {
      if (btn.childNodes[n].nodeType === 3 && btn.childNodes[n].textContent.trim()) {
        textNode = btn.childNodes[n];
        break;
      }
    }
    if (textNode) textNode.textContent = ' ' + label + ' ';
  }

  function initShop(root) {
    if (root.__fxShopReady) return;
    root.__fxShopReady = true;

    var form = root.querySelector('[data-fx-shop-form]');
    var variantInput = root.querySelector('[data-fx-variant-id]');
    var priceEl = root.querySelector('[data-fx-shop-price]');
    var compareEl = root.querySelector('[data-fx-shop-compare]');
    var sizeBtns = Array.prototype.slice.call(root.querySelectorAll('[data-fx-size]'));
    var thumbSizes = Array.prototype.slice.call(root.querySelectorAll('[data-fx-thumb-size]'));
    var addBtn = root.querySelector('[data-fx-add]');
    var buyBtn = root.querySelector('[data-fx-buy]');
    var errorEl = root.querySelector('[data-fx-shop-error]');
    var adding = false;

    function showError(msg) {
      if (!errorEl) return;
      if (!msg) {
        errorEl.hidden = true;
        errorEl.textContent = '';
        return;
      }
      errorEl.hidden = false;
      errorEl.textContent = msg;
    }

    function selectSize(btn) {
      if (!btn) return;
      var id = btn.getAttribute('data-variant-id');
      var available = btn.getAttribute('data-available') !== 'false';
      var sizeKey = canonicalSize(btn);
      /* Shopify-formatted money from Liquid (respects store currency format) */
      var money = btn.getAttribute('data-money') || '';
      var moneyCompare = btn.getAttribute('data-money-compare') || '';

      sizeBtns.forEach(function (b) {
        var on = b === btn || b.getAttribute('data-variant-id') === id;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
      });

      thumbSizes.forEach(function (b) {
        var on = b.getAttribute('data-variant-id') === id;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
      });

      if (variantInput && id) {
        variantInput.value = id;
        variantInput.disabled = false;
      }

      if (priceEl && money) {
        priceEl.textContent = money;
      }
      if (compareEl) {
        if (moneyCompare) {
          compareEl.textContent = moneyCompare;
          compareEl.hidden = false;
        } else {
          compareEl.textContent = '';
          compareEl.hidden = true;
        }
      }

      if (addBtn) {
        addBtn.disabled = !available;
        var label = available
          ? addBtn.getAttribute('data-label-add') || 'Add to cart'
          : addBtn.getAttribute('data-label-sold') || 'Sold out';
        setButtonLabel(addBtn, label);
      }
      if (buyBtn) buyBtn.disabled = !available;

      var stockBadge = root.querySelector('[data-fx-shop-stock]');
      if (stockBadge) {
        var stockStatus = stockBadge.querySelector('.fx-shop__stock-status');
        var stockText = stockBadge.querySelector('[data-fx-shop-stock-text]');
        if (stockStatus && stockText) {
          if (available) {
            stockStatus.classList.remove('fx-shop__stock-status--out');
            stockStatus.classList.add('fx-shop__stock-status--in');
            stockText.textContent = stockBadge.getAttribute('data-text-in') || 'In Stock';
          } else {
            stockStatus.classList.remove('fx-shop__stock-status--in');
            stockStatus.classList.add('fx-shop__stock-status--out');
            stockText.textContent = stockBadge.getAttribute('data-text-out') || 'Out of Stock';
          }
        }
      }

      try {
        if (window.FloorXProduct3D && typeof window.FloorXProduct3D.setSize === 'function') {
          window.FloorXProduct3D.setSize(sizeKey);
        }
      } catch (e1) {}
      try {
        window.dispatchEvent(
          new CustomEvent('floorx:size-change', {
            detail: { size: sizeKey, sizeKey: sizeKey, title: sizeKey, variantId: id }
          })
        );
      } catch (e2) {}
    }

    sizeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectSize(btn);
      });
    });

    thumbSizes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var vid = btn.getAttribute('data-variant-id');
        var match = sizeBtns.filter(function (s) {
          return s.getAttribute('data-variant-id') === vid;
        })[0];
        selectSize(match || btn);
      });
    });

    window.addEventListener('floorx:3d-ready', function () {
      var active =
        root.querySelector('[data-fx-size].is-active') ||
        root.querySelector('[data-fx-thumb-size].is-active') ||
        sizeBtns[0];
      if (active && window.FloorXProduct3D) {
        window.FloorXProduct3D.setSize(canonicalSize(active));
      }
    });

    var activeSize = root.querySelector('[data-fx-size].is-active') || sizeBtns[0];
    if (activeSize) selectSize(activeSize);

    /* ---- Shopify Cart AJAX (section rendering for drawer + bubble) ---- */
    function addToCart(opts) {
      opts = opts || {};
      if (!form || !variantInput || adding) return Promise.resolve();
      var id = variantInput.value;
      if (!id) return Promise.resolve();
      if (addBtn && addBtn.disabled) return Promise.resolve();

      adding = true;
      showError('');
      if (addBtn) {
        addBtn.setAttribute('aria-disabled', 'true');
        addBtn.classList.add('is-loading');
      }

      var cart = cartEl();
      var formData = new FormData(form);
      formData.set('id', id);
      formData.set('quantity', formData.get('quantity') || '1');

      if (cart && typeof cart.getSectionsToRender === 'function' && !opts.checkout) {
        var sectionIds = cart.getSectionsToRender().map(function (s) {
          return s.id;
        });
        formData.append('sections', sectionIds.join(','));
        formData.append('sections_url', window.location.pathname);
        if (typeof cart.setActiveElement === 'function') {
          cart.setActiveElement(document.activeElement);
        }
      }

      var addUrl = (routes().cart_add_url || '/cart/add') + '';
      return fetch(addUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, status: res.status, data: data };
          });
        })
        .then(function (result) {
          var data = result.data || {};
          if (!result.ok || data.status) {
            var msg =
              data.description ||
              data.message ||
              (window.cartStrings && window.cartStrings.error) ||
              'Could not add to cart.';
            showError(msg);
            return;
          }

          if (opts.checkout) {
            window.location.href = '/checkout';
            return;
          }

          if (cart && typeof cart.renderContents === 'function' && data.sections) {
            cart.classList.remove('is-empty');
            cart.renderContents(data);
          } else if (cart) {
            /* Fallback: re-fetch drawer section HTML then open */
            refreshCartDrawer().then(function () {
              if (typeof cart.open === 'function') cart.open(addBtn);
            });
          } else {
            window.location.href = routes().cart_url || '/cart';
          }

          try {
            document.dispatchEvent(new CustomEvent('cart:updated', { detail: data }));
          } catch (e3) {}
        })
        .catch(function () {
          showError((window.cartStrings && window.cartStrings.error) || 'Could not add to cart.');
        })
        .finally(function () {
          adding = false;
          if (addBtn) {
            addBtn.classList.remove('is-loading');
            addBtn.removeAttribute('aria-disabled');
          }
        });
    }

    function refreshCartDrawer() {
      var cart = cartEl();
      if (!cart) return Promise.resolve();
      return fetch((routes().cart_url || '/cart') + '?section_id=cart-drawer')
        .then(function (r) {
          return r.text();
        })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var next = doc.querySelector('#CartDrawer') || doc.querySelector('cart-drawer .drawer__inner');
          var cur = document.querySelector('#CartDrawer') || cart.querySelector('.drawer__inner');
          if (next && cur) cur.innerHTML = next.innerHTML;
          cart.classList.remove('is-empty');
        })
        .catch(function () {});
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        addToCart({ checkout: false });
      });
    }

    if (buyBtn) {
      buyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (buyBtn.disabled) return;
        /* Buy it now: add line then go to Shopify checkout */
        addToCart({ checkout: true });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
