import AEM from 'js/aem';

/**
 * We store the initial values so we can easily remove/add back values associated with those
 * elements. For example, we have to remove the "required" attribute from inputs that are
 * conditionally hidden so the form can be submitted even though the hidden (and irrelevant)
 * input has no value.
 */
function storeDefaultValues(element) {
  element.setAttribute('data-default-required', element.hasAttribute('required'));
  element.setAttribute('data-default-name', element.getAttribute('name'));
}

function restoreDefaultValues(element) {
  const isRequired = element.getAttribute('data-default-required') === 'true';
  if (isRequired) {
    element.setAttribute('required', true);
  } else if (element.hasAttribute('required')) {
    element.removeAttribute('required');
  }

  element.setAttribute('name', element.getAttribute('data-default-name'));
}

function removeSubmissionBlockers(element) {
  if (element.hasAttribute('required')) {
    element.removeAttribute('required');
  }

  element.removeAttribute('name');
}

export default class FormCountrySelection extends AEM.Component {
  init() {
    this.countryDropdown = this.element.querySelector(`${this.elementClass}__country-dropdown`);
    this.stateDropdown = this.element.querySelector(`${this.elementClass}__state-dropdown`);
    this.stateText = this.element.querySelector(`${this.elementClass}__state-text`);

    const allInputs = this.element.querySelectorAll('select, input');
    [...allInputs].forEach((element) => {
      storeDefaultValues(element);
    });

    if (AEM.isEditMode()) {
      return;
    }

    this.validateDropdown(this.countryDropdown.value);
    this.addEventListeners();
  }

  hideStateText() {
    this.stateText.setAttribute('hidden', 'hidden');
    removeSubmissionBlockers(this.stateText.querySelector('input'));
  }

  showStateText() {
    this.stateText.removeAttribute('hidden', 'hidden');
    restoreDefaultValues(this.stateText.querySelector('input'));
  }

  hideStateDropdown() {
    this.stateDropdown.setAttribute('hidden', 'hidden');
    removeSubmissionBlockers(this.stateDropdown.querySelector('select'));
  }

  showStateDropdown() {
    this.stateDropdown.removeAttribute('hidden');

    const defaultOption = this.stateDropdown.querySelector('option[disabled]');

    // NOTE: We have to remove the text of the first option so the browser's built-in
    // validation works. We rely on that to validate the overall form.
    if (defaultOption && !defaultOption.hasAttribute('data-default-text')) {
      this.stateDropdown.querySelector('option').textContent = '';
    }

    restoreDefaultValues(this.stateDropdown.querySelector('select'));
  }

  validateDropdown(value) {
    if (value === 'US') {
      this.showStateDropdown();
      this.hideStateText();
    } else {
      this.showStateText();
      this.hideStateDropdown();
    }
  }

  addEventListeners() {
    this.countryDropdown.addEventListener('change', (event) => {
      this.validateDropdown(event.target.value);
    });
  }
}
