export type Game = {
  id: string;
  name: string;
  shortName: string;
  currencyName: string;
  image: string;
  active: boolean;
};

export type Package = {
  id: string;
  gameId: string;
  amount: number;
  price: number;
  currency: string;
  popular?: boolean;
  active: boolean;
};

export type PaymentMethod = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  active: boolean;
};

export type FaqItem = {
  question: string;
  answer: string;
  category: string;
};

export const games: Game[] = [
  {
    id: "mobile-legends",
    name: "Mobile Legends: Bang Bang",
    shortName: "MLBB",
    currencyName: "Diamonds",
    image: "/images/games/mlbb.jpg",
    active: true,
  },
];

export const packages: Package[] = [
  {
    id: "mlbb-86",
    gameId: "mobile-legends",
    amount: 86,
    price: 150,
    currency: "DZD",
    active: true,
  },
  {
    id: "mlbb-172",
    gameId: "mobile-legends",
    amount: 172,
    price: 300,
    currency: "DZD",
    active: true,
  },
  {
    id: "mlbb-257",
    gameId: "mobile-legends",
    amount: 257,
    price: 450,
    currency: "DZD",
    popular: true,
    active: true,
  },
  {
    id: "mlbb-344",
    gameId: "mobile-legends",
    amount: 344,
    price: 600,
    currency: "DZD",
    active: true,
  },
  {
    id: "mlbb-514",
    gameId: "mobile-legends",
    amount: 514,
    price: 900,
    currency: "DZD",
    active: true,
  },
  {
    id: "mlbb-weekly",
    gameId: "mobile-legends",
    amount: 220, // 220 diamonds over week
    price: 350,
    currency: "DZD",
    popular: true,
    active: true,
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: "baridimob",
    name: "BaridiMob",
    description: "Pay easily using BaridiMob application",
    instructions: "Transfer the exact amount to RIP: 00799999000000000012. Keep the receipt to upload in the next step.",
    active: true,
  },
  {
    id: "ccp",
    name: "CCP Transfer",
    description: "Pay via Algérie Poste CCP",
    instructions: "Transfer the exact amount to CCP: 12345678 Clé 99. Name: MOCK NAME. Take a photo of the receipt to upload.",
    active: true,
  },
  {
    id: "binance",
    name: "Binance Pay",
    description: "Pay with crypto (USDT)",
    instructions: "Send the exact equivalent amount in USDT to Binance ID: 123456789. Save a screenshot of the completed transaction.",
    active: true,
  },
  {
    id: "flexy",
    name: "Flexy",
    description: "Pay using mobile credit (Mobilis, Djezzy, Ooredoo)",
    instructions: "Send the flexy to 0550000000. Wait for the confirmation SMS and take a screenshot, or just input the number you sent from.",
    active: true,
  },
];

export const faqs: FaqItem[] = [
  {
    category: "Orders",
    question: "How long does the recharge take?",
    answer: "After you submit your payment proof, our team manually verifies it. Most orders are processed within 15-30 minutes during working hours."
  },
  {
    category: "MLBB",
    question: "Where can I find my MLBB User ID?",
    answer: "Open Mobile Legends, tap your profile picture in the top left corner. Your User ID is the number shown below your settings (e.g., 123456789)."
  },
  {
    category: "MLBB",
    question: "Where can I find my Zone ID?",
    answer: "The Zone ID is the 4-digit number in parentheses right next to your User ID on your MLBB profile page (e.g., (1234))."
  },
  {
    category: "Payments",
    question: "What happens if my payment is rejected?",
    answer: "If we cannot verify your payment, your order will be marked as rejected. Our support team will contact you to resolve the issue or process a refund."
  },
  {
    category: "Recharge",
    question: "How does the recharge work?",
    answer: "You select your package, enter your game details, and pay using your preferred method. Once you upload the payment proof and we verify it, we send the Diamonds directly to your account."
  }
];
