import AEM from 'js/aem';
import submitForm from 'js/submitForm';

/**
 * Validate a group of checkboxes.
 * The validity status of a checkbox group gets set using the `data-valid` attribute.
 * `data-valid` can either be `true` or `false`.
 */
export default class RegistrationForm extends AEM.Component {
  init() {
    this.form = this.element.querySelector('form');
    this.statusElement = this.element.querySelector('.status-message');

    this.validity = {
      captcha: false,
      custom: false,
      native: false,
    };

    this.validateForm();
    this.setSubmitButtonStatus(this.isFormValid());

    this.addEventListeners();
  }

  setSubmitButtonStatus(isEnabled) {
    this.form.querySelector('[type="submit"]').disabled = !isEnabled;
  }

  validateNative() {
    const validity = this.form.checkValidity();
    this.validity.native = validity;
  }

  validateCustom() {
    const elementWithCustomError = this.form.querySelector('[data-valid="false"]');
    const hasFormCustomError = elementWithCustomError !== null;

    // This `data-valid` attribute is used by the callbacks defined in recaptcha.html
    this.form.setAttribute('data-valid', !hasFormCustomError);

    this.validity.custom = !hasFormCustomError;
  }

  validateCaptcha() {
    const isCaptchaInvalid = this.form.getAttribute('data-captcha') !== 'valid';
    this.validity.captcha = !isCaptchaInvalid;
  }

  validateForm() {
    this.validateNative();

    if (this.validity.native) {
      this.validateCustom();

      if (this.validity.custom) {
        this.validateCaptcha();
      }
    }
  }

  isFormValid() {
    return this.validity.native && this.validity.custom && this.validity.captcha;
  }

  setStatusMessage(status = '', message = '') {
    this.statusElement.setAttribute('data-status', status);
    this.statusElement.textContent = message;
  }


  addEventListeners() {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();

      this.validateCaptcha();
      if (this.isFormValid()) {
        this.form.insertAdjacentHTML('afterbegin', '<div class="overlay-loading"><div class="loader-animation"></div></div>');
        submitForm(this.form, this.statusElement, () => {}, true);
      } else {
        console.info('Form is invalid.');
      }
    });

    const validation = () => {
      // We depend on getting the most current state of the DOM.
      // If we don't wait two frames, this validation might be initiated
      // before the checkbox status and its `data-valid` attribute or
      // checked status was updated.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          this.validateForm();
          this.setSubmitButtonStatus(this.isFormValid());
        });
      });
    };

    const inputs = this.form.querySelectorAll('input, textarea');
    [...inputs].forEach((input) => {
      input.addEventListener('input', () => {
        input.classList.remove('field-error');
        validation();
      });
    });

    // NOTE: IE 10 doesn't fire the input event for checkboxes and radio inputs.
    // So we use the change event.
    const selects = this.form.querySelectorAll('input[type="checkbox"], input[type="radio"], select');
    [...selects].forEach((select) => {
      select.addEventListener('change', () => {
        select.classList.remove('field-error');
        validation();
      });
    });
  }
}
