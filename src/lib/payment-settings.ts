export interface PaymentAccountsSettings {
  baridimob: {
    rip: string;
    holder: string;
  };
  ccp: {
    account: string;
    cle: string;
    holder: string;
  };
  redotpay: {
    id: string;
  };
  flexy: {
    phone: string;
    feePercent: number;
  };
  whatsapp?: string;
  defaultMarginPercent: number;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentAccountsSettings = {
  baridimob: {
    rip: "00799999000000000012",
    holder: "JIN'S STORE",
  },
  ccp: {
    account: "12345678",
    cle: "99",
    holder: "JIN'S STORE",
  },
  redotpay: {
    id: "123456789",
  },
  flexy: {
    phone: "0776665110",
    feePercent: 20,
  },
  whatsapp: "+213550000000",
  defaultMarginPercent: 18,
};
