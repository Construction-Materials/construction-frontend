export const appConfig = {
  // Spacing configuration for forms
  spacing: {
    formSections: 'space-y-6',
    formFields: 'space-y-2',
    formCards: 'space-y-4',
    formButtons: 'pt-2',
    headerMargin: 'mt-4'
  },

  // Material units
  materialUnits: [
    { value: 'meters', label: 'm - metr' },
    { value: 'kilograms', label: 'kg - kilogram' },
    { value: 'cubic_meters', label: 'm³ - metr sześcienny' },
    { value: 'cubic_centimeters', label: 'cm³ - centymetr sześcienny' },
    { value: 'cubic_millimeters', label: 'mm³ - milimetr sześcienny' },
    { value: 'liters', label: 'l - litr' },
    { value: 'pieces', label: 'szt. - sztuka' },
    { value: 'other', label: 'Inne' }
  ],

  // Construction statuses
  constructionStatuses: [
    { value: 'planned', label: 'Planowana' },
    { value: 'active', label: 'W trakcie' },
    { value: 'completed', label: 'Zakończona' }
  ] as const,

  // Default categories for materials
  defaultCategories: [
    'Materiały podstawowe',
    'Wykończeniowe',
    'Instalacyjne',
    'Narzędzia',
    'Bezpieczeństwo'
  ]
};

export type ConstructionStatus = typeof appConfig.constructionStatuses[number]['value'];
