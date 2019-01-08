import AEM from 'js/aem';

import './index.scss';

import Form from './form';
import FormCountrySelection from './form-country-selection';

const componentClass = '.c10-partner-registration-form';

AEM.registerComponent(`${componentClass}`, Form);
AEM.registerComponent(`${componentClass}__country-selection`, FormCountrySelection);
