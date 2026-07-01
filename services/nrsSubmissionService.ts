import { nrsApiService, type NRSInvoiceData } from './nrsApiService';
import { supabase } from './supabaseClient';
import { db } from './db';
import { monitoringService } from './monitoringService';

export interface NRSStatus {
  stage: 'idle' | 'validating' | 'generating_irn' | 'signing' | 'transmitting' | 'qr_code' | 'complete' | 'error';
  message: string;
  irn?: string;
  csid?: string;
  qrCode?: string;
  error?: string;
}

export interface NRSSubmission {
  id: string;
  invoice_id: string;
  irn: string;
  csid: string;
  qr_code: string;
  status: 'pending' | 'transmitted' | 'confirmed' | 'failed';
  submitted_at: string;
  confirmed_at?: string;
  error?: string;
}

function mapInvoiceToNRS(invoice: any, seller: any): NRSInvoiceData {
  const now = new Date();
  return {
    business_id: seller.organizationId || '',
    irn: `INV-${invoice.id.slice(-6).toUpperCase()}-${now.getFullYear()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    issue_date: invoice.issueDate || now.toISOString().split('T')[0],
    issue_time: now.toTimeString().split(' ')[0],
    invoice_type_code: '381', // Standard Tax Invoice
    document_currency_code: invoice.currency || 'NGN',
    tax_currency_code: 'NGN',
    accounting_supplier_party: {
      party_name: seller.name || 'Aura Business',
      tin: seller.tin || '00000000-0000',
      email: seller.email || '',
      telephone: seller.phoneNumber || '+2340000000000',
      business_description: 'Services',
      postal_address: {
        street_name: seller.address || '',
        city_name: 'Lagos',
        lga: 'NG-LA-IG',
        state: 'NG-LA',
        postal_zone: '101241',
        country: 'NG',
      },
    },
    accounting_customer_party: {
      party_name: invoice.customer,
      tin: invoice.customerTin || '00000000-0000',
      email: invoice.customerEmail || '',
      telephone: '',
      business_description: '',
      postal_address: {
        street_name: '',
        city_name: '',
        lga: '',
        state: '',
        postal_zone: '',
        country: 'NG',
      },
    },
    tax_total: [{
      tax_amount: invoice.vat || 0,
      tax_subtotal: [{
        taxable_amount: invoice.amount || 0,
        tax_amount: invoice.vat || 0,
        tax_category: { id: 'STANDARD_VAT', percent: 7.5 },
      }],
    }],
    legal_monetary_total: {
      line_extension_amount: invoice.amount || 0,
      tax_exclusive_amount: invoice.amount || 0,
      tax_inclusive_amount: invoice.total || 0,
      payable_amount: invoice.total || 0,
    },
    invoice_line: (invoice.lineItems || []).map((item: any, i: number) => ({
      hsn_code: item.hsnCode || '9988',
      product_category: item.category || 'Services',
      invoiced_quantity: item.quantity || 1,
      line_extension_amount: item.total || item.unitPrice * item.quantity || 0,
      item: {
        name: item.name || `Item ${i + 1}`,
        description: item.description || item.name || '',
        sellers_item_identification: item.sku || '',
      },
      price: {
        price_amount: item.unitPrice || 0,
        base_quantity: item.quantity || 1,
        price_unit: 'NGN per 1',
      },
      discount_amount: 0,
      discount_rate: 0,
      fee_rate: 0,
      fee_amount: 0,
      tax_code: '',
      tax_rate: 7.5,
    })),
    sale_type: 0,
  };
}

export const nrsSubmissionService = {
  submitInvoice: async (
    invoice: any,
    seller: any,
    onStatus?: (status: NRSStatus) => void
  ): Promise<NRSSubmission | null> => {
    if (!nrsApiService.isConfigured()) {
      onStatus?.({ stage: 'error', message: 'NRS API not configured', error: 'Set VITE_NRS_API_KEY and VITE_NRS_SERVICE_ID in .env.local' });
      return null;
    }

    const nrsData = mapInvoiceToNRS(invoice, seller);
    const submissionId = `nrs_${Date.now()}`;

    // Stage 1: Validate invoice
    onStatus?.({ stage: 'validating', message: 'Validating invoice data with NRS...' });
    const validation = await nrsApiService.validateInvoice(nrsData);
    if (!validation.ok) {
      monitoringService.trackError('NRS_SUBMISSION', `Validation failed: ${validation.error}`);
      onStatus?.({ stage: 'error', message: 'Invoice validation failed', error: validation.error });
      return null;
    }

    // Stage 2: Generate IRN
    onStatus?.({ stage: 'generating_irn', message: 'Generating Invoice Reference Number...' });
    const irnResult = await nrsApiService.generateIRN(nrsData.irn);
    if (!irnResult.ok) {
      monitoringService.trackError('NRS_SUBMISSION', `IRN generation failed: ${irnResult.error}`);
      onStatus?.({ stage: 'error', message: 'IRN generation failed', error: irnResult.error });
      return null;
    }

    // Stage 3: Sign invoice
    onStatus?.({ stage: 'signing', message: 'Digitally signing invoice...' });
    const signResult = await nrsApiService.signInvoice(nrsData);
    if (!signResult.ok) {
      monitoringService.trackError('NRS_SUBMISSION', `Signing failed: ${signResult.error}`);
      onStatus?.({ stage: 'error', message: 'Invoice signing failed', error: signResult.error });
      return null;
    }

    // Stage 4: Transmit to NRS
    onStatus?.({ stage: 'transmitting', message: 'Transmitting invoice to NRS...' });
    const transmitResult = await nrsApiService.transmitInvoice(nrsData);
    if (!transmitResult.ok) {
      monitoringService.trackError('NRS_SUBMISSION', `Transmission failed: ${transmitResult.error}`);
      onStatus?.({ stage: 'error', message: 'Invoice transmission failed', error: transmitResult.error });
      return null;
    }

    // Stage 5: Get QR code
    onStatus?.({ stage: 'qr_code', message: 'Generating QR code...' });
    const qrResult = await nrsApiService.getQRCode(irnResult.irn || nrsData.irn);

    const submission: NRSSubmission = {
      id: submissionId,
      invoice_id: invoice.id,
      irn: irnResult.irn || nrsData.irn,
      csid: irnResult.csid || '',
      qr_code: qrResult.qr_code_png || '',
      status: 'transmitted',
      submitted_at: new Date().toISOString(),
    };

    // Save to Supabase
    if (supabase) {
      const { error } = await supabase.from('nrs_submissions').insert({
        id: submission.id,
        invoice_id: submission.invoice_id,
        irn: submission.irn,
        csid: submission.csid,
        qr_code: submission.qr_code,
        status: submission.status,
        submitted_at: submission.submitted_at,
        organization_id: db.getOrgId(),
      });
      if (error) console.error('NRS submission save error:', error);
    }

    monitoringService.log('info', 'NRS_SUBMISSION', `Invoice ${invoice.id} submitted to NRS`, { irn: submission.irn });
    onStatus?.({ stage: 'complete', message: 'Invoice successfully submitted to NRS', irn: submission.irn, csid: submission.csid, qrCode: submission.qr_code });

    return submission;
  },

  getSubmissionStatus: async (invoiceId: string): Promise<NRSSubmission | null> => {
    if (!supabase) return null;
    const { data } = await supabase
      .from('nrs_submissions')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();
    return data as NRSSubmission | null;
  },

  confirmDelivery: async (irn: string): Promise<boolean> => {
    const result = await nrsApiService.confirmInvoice(irn);
    if (result.ok && supabase) {
      await supabase
        .from('nrs_submissions')
        .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
        .eq('irn', irn);
    }
    return result.ok || false;
  },
};
