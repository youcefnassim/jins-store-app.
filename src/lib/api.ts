import { Package, PaymentMethod, packages, paymentMethods, games, Game } from './mock-data';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export type Order = {
  id: string;
  gameId: string;
  playerId: string;
  zoneId: string;
  phone: string;
  packageId: string;
  paymentMethodId: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
};

// In-memory mock database for orders
let mockOrders: Order[] = [];

export const api = {
  async getGames(): Promise<Game[]> {
    await delay(500);
    return games.filter(g => g.active);
  },

  async getGame(id: string): Promise<Game | undefined> {
    await delay(300);
    return games.find(g => g.id === id);
  },

  async getPackages(gameId: string): Promise<Package[]> {
    await delay(500);
    return packages.filter(p => p.gameId === gameId && p.active);
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    await delay(400);
    return paymentMethods.filter(p => p.active);
  },

  async createOrder(data: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<Order> {
    await delay(1500);
    
    // Generate a mock order ID
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `MLBB-${dateStr}-${randomNum}`;
    
    const newOrder: Order = {
      ...data,
      id: orderId,
      status: 'pending', // Starts as pending until payment is verified
      createdAt: new Date().toISOString(),
    };
    
    mockOrders.push(newOrder);
    return newOrder;
  },

  async getOrder(id: string): Promise<Order | undefined> {
    await delay(800);
    return mockOrders.find(o => o.id === id);
  }
};
