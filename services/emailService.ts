import type { Invoice, Bill } from '../types';

function formatNGN(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

export type EmailTemplateType = 'formal' | 'casual' | 'followup' | 'overdue';

interface EmailTemplate {
  subject: string;
  body: string;
}

function generateInvoiceEmail(invoice: Invoice, type: EmailTemplateType): EmailTemplate {
  const invNum = `INV-${invoice.id.slice(-6).toUpperCase()}`;
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

  const templates: Record<EmailTemplateType, EmailTemplate> = {
    formal: {
      subject: `Invoice ${invNum} — ${formatNGN(invoice.total)}`,
      body: [
        `Dear ${invoice.customer},`,
        ``,
        `Please find attached Invoice ${invNum} for ${invoice.description || 'services rendered'}.`,
        ``,
        `Amount Due: ${formatNGN(invoice.total)}`,
        `Due Date: ${dueDate}`,
        ``,
        `Payment can be made via bank transfer or online payment. Please reference the invoice number in your payment.`,
        ``,
        `Kindly remit payment on or before the due date to avoid late fees.`,
        ``,
        `Thank you for your business.`,
        ``,
        `Warm regards,`,
        `[Your Name]`,
        `[Your Company]`,
      ].join('\n'),
    },
    casual: {
      subject: `Quick heads up — Invoice ${invNum}`,
      body: [
        `Hey ${invoice.customer}!`,
        ``,
        `Just sending over Invoice ${invNum} for ${formatNGN(invoice.total)}.`,
        `Due: ${dueDate}`,
        ``,
        `Let me know if you have any questions. Thanks!`,
        ``,
        `Best,`,
        `[Your Name]`,
      ].join('\n'),
    },
    followup: {
      subject: `Follow-up: Invoice ${invNum} — ${formatNGN(invoice.total)}`,
      body: [
        `Hi ${invoice.customer},`,
        ``,
        `I hope this message finds you well. I'm following up on Invoice ${invNum} for ${formatNGN(invoice.total)}, which was issued on ${new Date(invoice.issueDate).toLocaleDateString()}.`,
        ``,
        `The payment was due on ${dueDate}. Could you please confirm when we can expect payment?`,
        ``,
        `If you've already sent payment, please disregard this message.`,
        ``,
        `Thank you,`,
        `[Your Name]`,
      ].join('\n'),
    },
    overdue: {
      subject: `OVERDUE: Invoice ${invNum} — Immediate Payment Required`,
      body: [
        `Dear ${invoice.customer},`,
        ``,
        `This is a formal reminder that Invoice ${invNum} for ${formatNGN(invoice.total)} is now OVERDUE.`,
        ``,
        `Original Due Date: ${dueDate}`,
        `Outstanding Amount: ${formatNGN(invoice.total)}`,
        ``,
        `Please arrange for immediate payment. Continued delay may result in late fees and suspension of services.`,
        ``,
        `If you have already made payment, please disregard this notice and provide your payment reference.`,
        ``,
        `Urgent attention to this matter is appreciated.`,
        ``,
        `Regards,`,
        `[Your Name]`,
        `[Your Company]`,
      ].join('\n'),
    },
  };

  return templates[type];
}

function generateBillReminder(bill: Bill, type: EmailTemplateType): EmailTemplate {
  const billNum = `BILL-${bill.id.slice(-6).toUpperCase()}`;
  const dueDate = new Date(bill.dueDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

  return {
    subject: type === 'overdue' ? `OVERDUE: ${billNum} — ${formatNGN(bill.amount)}` : `Payment Reminder: ${billNum}`,
    body: [
      `Dear ${bill.vendor},`,
      ``,
      type === 'overdue'
        ? `This is a reminder that Bill ${billNum} for ${formatNGN(bill.amount)} is now overdue.`
        : `This is a friendly reminder about Bill ${billNum} for ${formatNGN(bill.amount)}.`,
      ``,
      `Due Date: ${dueDate}`,
      `Amount: ${formatNGN(bill.amount)}`,
      ``,
      `Please process this payment at your earliest convenience.`,
      ``,
      `Thank you,`,
      `[Your Name]`,
    ].join('\n'),
  };
}

export function generateEmail(
  recipient: Invoice | Bill,
  type: EmailTemplateType,
  isInvoice: boolean = true
): EmailTemplate {
  if (isInvoice) {
    return generateInvoiceEmail(recipient as Invoice, type);
  }
  return generateBillReminder(recipient as Bill, type);
}

export function getEmailTypes(): { value: EmailTemplateType; label: string; description: string }[] {
  return [
    { value: 'formal', label: 'Formal', description: 'Professional business tone' },
    { value: 'casual', label: 'Casual', description: 'Friendly and relaxed' },
    { value: 'followup', label: 'Follow-up', description: 'Polite reminder' },
    { value: 'overdue', label: 'Overdue', description: 'Urgent payment request' },
  ];
}
