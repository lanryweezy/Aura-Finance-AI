export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  headerGradient: string;
  accentColor: string;
  borderRadius: string;
  fontFamily: string;
}

export const INVOICE_TEMPLATES: InvoiceTemplate[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean design with gradient accents',
    headerGradient: 'linear-gradient(135deg, #00F5D4 0%, #9B5DE5 100%)',
    accentColor: '#00F5D4',
    borderRadius: '16px',
    fontFamily: 'Inter, sans-serif',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional professional style',
    headerGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    accentColor: '#1a1a2e',
    borderRadius: '4px',
    fontFamily: 'Georgia, serif',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple, lots of whitespace',
    headerGradient: 'none',
    accentColor: '#333333',
    borderRadius: '0px',
    fontFamily: 'Helvetica, sans-serif',
  },
];

export function getTemplateById(id: string): InvoiceTemplate {
  return INVOICE_TEMPLATES.find(t => t.id === id) || INVOICE_TEMPLATES[0];
}
