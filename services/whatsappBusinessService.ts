import { monitoringService } from './monitoringService';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const WHATSAPP_TOKEN = import.meta.env.VITE_WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_ID = import.meta.env.VITE_WHATSAPP_PHONE_ID || '';

export interface WhatsAppMessage {
  to: string;
  templateName: string;
  languageCode: string;
  parameters: Array<{ type: string; text: string }>;
}

export const whatsappService = {
  // Send invoice via WhatsApp Business API
  sendInvoice: async (phone: string, invoiceNumber: string, amount: number, paymentLink: string): Promise<boolean> => {
    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
      // Fallback to WhatsApp Web
      const msg = `📄 Invoice ${invoiceNumber}\n\nAmount: ₦${amount.toLocaleString()}\nPay: ${paymentLink}`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
      return true;
    }

    try {
      const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: 'invoice_notification',
            language: { code: 'en_US' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: invoiceNumber },
                  { type: 'text', text: `₦${amount.toLocaleString()}` },
                  { type: 'text', text: paymentLink },
                ],
              },
            ],
          },
        }),
      });

      if (!response.ok) {
        monitoringService.trackError('WHATSAPP', `API error: ${response.status}`);
        return false;
      }
      return true;
    } catch (error) {
      monitoringService.trackError('WHATSAPP', error as Error);
      return false;
    }
  },

  // Send payment reminder
  sendReminder: async (phone: string, customerName: string, amount: number, daysOverdue: number): Promise<boolean> => {
    const msg = `Hi ${customerName}, this is a friendly reminder that your invoice for ₦${amount.toLocaleString()} is ${daysOverdue} days overdue. Please make payment at your earliest convenience.`;

    if (!WHATSAPP_TOKEN) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
      return true;
    }

    try {
      await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: msg },
        }),
      });
      return true;
    } catch (error) {
      monitoringService.trackError('WHATSAPP', error as Error);
      return false;
    }
  },

  // Send payment confirmation
  sendConfirmation: async (phone: string, customerName: string, amount: number, invoiceNumber: string): Promise<boolean> => {
    const msg = `✅ Payment Confirmed!\n\nHi ${customerName}, we've received your payment of ₦${amount.toLocaleString()} for Invoice ${invoiceNumber}.\n\nThank you for your business!`;

    if (!WHATSAPP_TOKEN) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
      return true;
    }

    try {
      await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: msg },
        }),
      });
      return true;
    } catch (error) {
      monitoringService.trackError('WHATSAPP', error as Error);
      return false;
    }
  },

  isConfigured: (): boolean => !!(WHATSAPP_TOKEN && WHATSAPP_PHONE_ID),
};
