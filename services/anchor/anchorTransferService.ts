import { anchorService } from './anchorService';
import { supabase } from '../supabaseClient';
import { AnchorTransfer } from '../../types/anchor';
import { generateSecureToken } from '../securityUtils';

export const anchorTransferService = {
  createCounterparty: async (accountName: string, accountNumber: string, bankCode: string) => {
    return anchorService.callApi('createCounterparty', {
        data: {
          type: 'CounterParty',
          attributes: {
            accountName,
            accountNumber,
            bankCode
          }
        }
    });
  },

  createNipTransfer: async (
    sourceAccountId: string,
    counterPartyId: string,
    amount: number, // kobo
    reason: string
  ): Promise<AnchorTransfer> => {
    const reference = `TRF_${Date.now()}_${generateSecureToken(6).toUpperCase()}`;

    const response = await anchorService.callApi('createNipTransfer', {
        data: {
          type: 'NIPTransfer',
          attributes: {
            amount,
            currency: 'NGN',
            reason,
            reference
          },
          relationships: {
            account: {
              data: {
                id: sourceAccountId,
                type: 'DepositAccount'
              }
            },
            counterParty: {
              data: {
                id: counterPartyId,
                type: 'CounterParty'
              }
            }
          }
        }
    });

    const transfer = Array.isArray(response.data) ? response.data[0] : response.data;
    if (!transfer || !transfer.id) {
        throw new Error('Failed to parse Anchor transfer response');
    }

    const { error } = await supabase
      .from('anchor_transfers')
      .insert({
        anchor_id: transfer.id,
        reference: reference,
        amount: amount,
        currency: 'NGN',
        status: transfer.attributes?.status || 'pending',
        source_account_id: sourceAccountId,
        destination_counterparty_id: counterPartyId,
        reason: reason
      });

    if (error) {
      console.error('Failed to link Anchor transfer in DB:', error);
    }

    return transfer;
  }
};
