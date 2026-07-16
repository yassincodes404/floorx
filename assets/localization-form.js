if (!customElements.get('localization-form')) {
  customElements.define(
    'localization-form',
    class LocalizationForm extends HTMLElement {
      constructor() {
        super();
        this.elements = {
          input: this.querySelector('input[name="locale_code"], input[name="country_code"]'),
          button: this.querySelector('button.disclosure__button, button[type="button"], button'),
          panel: this.querySelector('.disclosure__list-wrapper'),
        };

        if (!this.elements.button || !this.elements.panel || !this.elements.input) return;

        this.elements.button.addEventListener('click', this.openSelector.bind(this));
        this.elements.button.addEventListener('focusout', this.closeSelector.bind(this));
        this.addEventListener('keyup', this.onContainerKeyUp.bind(this));
        this.querySelectorAll('a[data-value]').forEach((item) =>
          item.addEventListener('click', this.onItemClick.bind(this))
        );

        this.onDocumentClick = this.onDocumentClick.bind(this);
        document.addEventListener('click', this.onDocumentClick);
      }

      disconnectedCallback() {
        document.removeEventListener('click', this.onDocumentClick);
      }

      onDocumentClick(event) {
        if (!this.contains(event.target)) {
          this.hidePanel();
        }
      }

      hidePanel() {
        if (!this.elements.button || !this.elements.panel) return;
        this.elements.button.setAttribute('aria-expanded', 'false');
        this.elements.panel.setAttribute('hidden', true);
      }

      onContainerKeyUp(event) {
        if (event.code.toUpperCase() !== 'ESCAPE') return;
        if (this.elements.button.getAttribute('aria-expanded') === 'false') return;
        this.hidePanel();
        event.stopPropagation();
        this.elements.button.focus();
      }

      isLocalDevHost() {
        const h = window.location.hostname;
        return h === '127.0.0.1' || h === 'localhost' || h === '0.0.0.0';
      }

      /**
       * Language: go to language-prefixed URL (loads ar.json / en.default.json).
       * On live stores, also POST localization form so Shopify cookies update.
       * Country: always form POST.
       */
      onItemClick(event) {
        event.preventDefault();
        const link = event.currentTarget;
        const value = link.dataset.value;
        const form = this.querySelector('form');
        const isLocale = this.elements.input && this.elements.input.name === 'locale_code';
        let langUrl = link.dataset.langUrl || link.getAttribute('href') || '';
        if (langUrl === '#' || langUrl === '') langUrl = null;

        if (this.elements.input) {
          this.elements.input.value = value;
        }

        if (isLocale && langUrl) {
          const search = window.location.search || '';
          const hash = window.location.hash || '';
          const nextPath = langUrl.includes('?') ? langUrl : langUrl + search;
          const next = nextPath + hash;

          // Live store: form POST with return_to language URL (sets locale cookie + redirects)
          if (form && !this.isLocalDevHost()) {
            let returnTo = form.querySelector('input[name="return_to"]');
            if (!returnTo) {
              returnTo = document.createElement('input');
              returnTo.type = 'hidden';
              returnTo.name = 'return_to';
              form.appendChild(returnTo);
            }
            returnTo.value = nextPath;
            form.submit();
            return;
          }

          // Local theme dev: POST /localization often 500s — navigate by URL only
          window.location.assign(next);
          return;
        }

        if (!form) {
          if (langUrl) window.location.assign(langUrl);
          return;
        }

        let returnTo = form.querySelector('input[name="return_to"]');
        if (!returnTo) {
          returnTo = document.createElement('input');
          returnTo.type = 'hidden';
          returnTo.name = 'return_to';
          form.appendChild(returnTo);
        }
        returnTo.value = window.location.pathname + window.location.search;
        form.submit();
      }

      openSelector(event) {
        if (event) event.stopPropagation();
        this.elements.button.focus();
        this.elements.panel.toggleAttribute('hidden');
        this.elements.button.setAttribute(
          'aria-expanded',
          (this.elements.button.getAttribute('aria-expanded') === 'false').toString()
        );
      }

      closeSelector(event) {
        const related = event.relatedTarget;
        const isChild =
          (related && this.elements.panel.contains(related)) ||
          (related && this.elements.button.contains(related)) ||
          (related && this.contains(related));
        if (!related || !isChild) {
          this.hidePanel();
        }
      }
    }
  );
}
