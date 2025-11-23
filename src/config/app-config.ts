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
    { value: 'szt.', label: 'szt. - sztuka' },
    { value: 'kg', label: 'kg - kilogram' },
    { value: 't', label: 't - tona' },
    { value: 'm', label: 'm - metr' },
    { value: 'm²', label: 'm² - metr kwadratowy' },
    { value: 'm³', label: 'm³ - metr sześcienny' },
    { value: 'l', label: 'l - litr' },
    { value: 'opak.', label: 'opak. - opakowanie' },
    { value: 'worek', label: 'worek' },
    { value: 'paleta', label: 'paleta' }
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
