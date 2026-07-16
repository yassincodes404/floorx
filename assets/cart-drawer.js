class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    const overlay = this.querySelector('#CartDrawer-Overlay');
    if (overlay) overlay.addEventListener('click', this.close.bind(this));
    this.setHeaderCartIconAccessibility();
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('#cart-icon-bubble');
    if (!cartLink) return;
    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
    cartLink.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add('animate', 'active');
      const cartDrawerItems = this.querySelector('cart-drawer-items');
      if (cartDrawerItems) {
        if (typeof cartDrawerItems.updateCartUpsellToggleState === 'function') {
          cartDrawerItems.updateCartUpsellToggleState();
        }
        if (typeof cartDrawerItems.updateCartUpsellVisibility === 'function') {
          cartDrawerItems.updateCartUpsellVisibility();
        }
      }
    });

    this.addEventListener(
      'transitionend',
      () => {
        const containerToTrapFocusOn = this.classList.contains('is-empty')
          ? this.querySelector('.drawer__inner-empty')
          : document.getElementById('CartDrawer');
        const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );

    document.body.classList.add('overflow-hidden');
  }

  close() {
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
    document.body.classList.remove('overflow-hidden');
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if (cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  renderContents(parsedState) {
    this.classList.remove('is-empty');
    const inner = this.querySelector('.drawer__inner');
    if (inner) inner.classList.remove('is-empty');

    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);
      if (!sectionElement || !parsedState.sections || !parsedState.sections[section.id]) return;

      const html = this.getSectionInnerHTML(parsedState.sections[section.id], section.sectionSelector);
      if (html == null) return;
      sectionElement.innerHTML = html;
    });

    /* Keep badge count in sync even if section HTML is partial */
    if (typeof parsedState.item_count === 'number') {
      this.updateCartIconCount(parsedState.item_count);
    } else if (parsedState.items && Array.isArray(parsedState.items)) {
      /* cart/add.js returns items array, not always item_count */
      const count = parsedState.items.reduce((n, it) => n + (it.quantity || 0), 0);
      if (count) this.updateCartIconCount(count);
    }

    setTimeout(() => {
      const overlay = this.querySelector('#CartDrawer-Overlay');
      if (overlay) {
        overlay.addEventListener('click', this.close.bind(this));
      }
      this.open();
    });
  }

  updateCartIconCount(count) {
    const link = document.getElementById('cart-icon-bubble');
    if (!link) return;
    link.dataset.cartCount = String(count);

    let bubble = link.querySelector('.cart-count-bubble');
    if (count <= 0) {
      if (bubble) bubble.remove();
      return;
    }

    const label = count > 99 ? '99+' : String(count);
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.className = 'cart-count-bubble';
      link.appendChild(bubble);
    }
    bubble.dataset.cartCount = String(count);
    bubble.innerHTML =
      '<span aria-hidden="true">' +
      label +
      '</span><span class="visually-hidden">' +
      count +
      ' items in cart</span>';
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const el = (selector && doc.querySelector(selector)) || doc.querySelector('.shopify-section') || doc.body;
    return el ? el.innerHTML : '';
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer',
        sectionSelector: '#CartDrawer',
      },
      {
        id: 'cart-icon-bubble',
        sectionSelector: '.shopify-section',
      },
    ];
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner',
      },
      {
        /* Replace #cart-icon-bubble innerHTML with section contents (not a nested .shopify-section) */
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: null,
      },
    ];
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);
