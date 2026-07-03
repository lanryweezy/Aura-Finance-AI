import { monitoringService } from './monitoringService';

export const slackService = {
  sendNotification: async (channel: string, message: string, webhookUrl?: string): Promise<boolean> => {
    const url = webhookUrl || import.meta.env.VITE_SLACK_WEBHOOK_URL;
    if (!url) {
      monitoringService.log('info', 'SLACK', `Would send to #${channel}: ${message}`);
      return false;
    }

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          text: message,
          username: 'Aura Finance AI',
          icon_emoji: ':robot_face:',
        }),
      });
      return true;
    } catch (error) {
      monitoringService.trackError('SLACK', error as Error);
      return false;
    }
  },

  sendInvoiceAlert: async (customer: string, amount: number, status: string) => {
    return slackService.sendNotification('#finance', `📄 Invoice ${status}: ${customer} — ₦${amount.toLocaleString()}`);
  },

  sendPaymentAlert: async (amount: number, source: string) => {
    return slackService.sendNotification('#payments', `💰 Payment received: ₦${amount.toLocaleString()} from ${source}`);
  },

  sendPayrollAlert: async (period: string, totalNet: number) => {
    return slackService.sendNotification('#payroll', `👥 Payroll processed for ${period} — Total net: ₦${totalNet.toLocaleString()}`);
  },

  isConfigured: (): boolean => !!(import.meta.env.VITE_SLACK_WEBHOOK_URL),
};
