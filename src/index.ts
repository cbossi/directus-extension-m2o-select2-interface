import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

// see https://github.com/directus/directus/discussions/12979#discussioncomment-2630229
export default defineInterface({
  id: 'm2o-select2-interface',
  name: 'Many to One Select2',
  icon: 'view_stream',
  description: 'Select2 for many to one fields',
  component: InterfaceComponent,
  options: null,
  group: 'relational',
  types: ['alias'],
  localTypes: ['m2o'],
  relational: true
});
