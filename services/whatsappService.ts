
import { monitoringService } from './monitoringService';

export interface WhatsAppMessage {
    id: string;
    sender: string;
    timestamp: string;
    text?: string;
    imageUrl?: string;
    status: 'unprocessed' | 'processed' | 'ignored';
}

class WhatsAppService {
    private messages: WhatsAppMessage[] = [
        {
            id: 'wa_1',
            sender: '+234 803 123 4567',
            timestamp: new Date().toISOString(),
            text: "Hey, I just paid for the delivery. Here is the screenshot.",
            imageUrl: "https://placehold.co/400x600/darkblue/white?text=Bank+Transfer+Receipt\nAmount:+NGN+45,000\nRef:+Delivery+Fee",
            status: 'unprocessed'
        },
        {
            id: 'wa_2',
            sender: '+234 701 987 6543',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            text: "Please record this expense for diesel. 150,000 NGN.",
            status: 'unprocessed'
        }
    ];

    getMessages(): WhatsAppMessage[] {
        return this.messages;
    }

    async processMessage(id: string): Promise<boolean> {
        const msg = this.messages.find(m => m.id === id);
        if (!msg) return false;

        msg.status = 'processed';
        monitoringService.log('info', 'WHATSAPP_ENGINE', `Processed WhatsApp message from ${msg.sender}`);
        return true;
    }
}

export const whatsappService = new WhatsAppService();
