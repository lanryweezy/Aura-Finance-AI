export interface AnchorCustomer {
  id: string;
  type: string;
  attributes: {
    createdAt: string;
    doingBusinessAs?: string;
    soleProprietor?: boolean;
    fullName?: {
      firstName: string;
      lastName: string;
      middleName?: string;
      maidenName?: string;
    };
    description?: string;
    email: string;
    verification?: {
      level: string;
      status: string;
      details: Array<{
        status: string;
        type: string;
        validatedItems: any[];
      }>;
    };
  };
}

export interface AnchorDepositAccount {
  id: string;
  type: string;
  attributes: {
    productName: string;
    balance?: number;
    status: string;
    createdAt?: string;
  };
  relationships?: {
    customer?: {
      data?: {
        id: string;
        type: string;
      };
    };
  };
}

export interface AnchorVirtualNuban {
  id: string;
  type: string;
  attributes: {
    createdAt: string;
    bank: {
      id: string;
      name: string;
      nipCode: string;
    };
    accountName: string;
    permanent: boolean;
    currency: string;
    accountNumber: string;
    status: string;
  };
}

export interface AnchorCounterparty {
  id: string;
  type: string;
  attributes: {
    createdAt: string;
    bank: {
      id: string;
      name: string;
      bankCode: string;
    };
    accountName: string;
    accountNumber: string;
  };
}

export interface AnchorTransfer {
  id: string;
  type: string;
  attributes: {
    createdAt: string;
    reason: string;
    amount: number;
    currency: string;
    reference: string;
    status: string;
  };
  relationships?: {
    counterParty?: { data?: { id: string; type: string } };
    account?: { data?: { id: string; type: string } };
    customer?: { data?: { id: string; type: string } };
  };
}

export interface AnchorWebhookEvent {
  id: string;
  type: string;
  attributes: {
    createdAt: string;
  };
  relationships: {
    transfer?: { data: { id: string; type: string } };
    counterParty?: { data: { id: string; type: string } };
    account?: { data: { id: string; type: string } };
    customer?: { data: { id: string; type: string } };
  };
}
