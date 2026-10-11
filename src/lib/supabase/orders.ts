export interface CreateOrderParams {
  userId?: string;
  game: string;
  packageId: string;
  packageName: string;
  playerId: string;
  zoneId?: string;
  phone?: string;
  paymentMethod?: string;
  promoCode?: string;
  receiptFile: File;
}

/**
 * Creates an order by delegating to the secure server API route (/api/orders/create).
 * This ensures all price calculations, rate limiting, and receipts are validated server-side.
 */
export async function createOrder(params: CreateOrderParams) {
  try {
    const formData = new FormData();
    formData.append('game', params.game);
    formData.append('packageId', params.packageId);
    formData.append('packageName', params.packageName);
    formData.append('playerId', params.playerId);
    if (params.zoneId) formData.append('zoneId', params.zoneId);
    if (params.phone) formData.append('phone', params.phone);
    if (params.paymentMethod) formData.append('paymentMethod', params.paymentMethod);
    if (params.promoCode) formData.append('promoCode', params.promoCode);
    formData.append('receiptFile', params.receiptFile);

    const res = await fetch('/api/orders/create', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Échec de la commande');
    }

    return { success: true, orderId: data.orderId };
  } catch (error: any) {
    console.error('Error in createOrder helper:', error);
    throw new Error(error.message || 'Échec de création de la commande');
  }
}
