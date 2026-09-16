import { supabase } from "./client";

export interface CreateOrderParams {
  userId: string;
  game: string;
  packageId: string;
  packageName: string;
  playerId: string;
  price: string;
  pointsToAward: number;
  receiptFile: File;
}

export async function createOrder(params: CreateOrderParams) {
  try {
    // 1. Upload the receipt file to Supabase Storage
    const timestamp = Date.now();
    const fileExtension = params.receiptFile.name.split('.').pop();
    const fileName = `${params.userId}/${timestamp}.${fileExtension}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, params.receiptFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error("Failed to upload image to Supabase: " + uploadError.message);
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    // 2. Create the order document in PostgreSQL
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: params.userId,
        game: params.game,
        package: params.packageName,
        player_id: params.playerId,
        price: params.price,
        points_to_award: params.pointsToAward,
        receipt_url: publicUrl,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      throw new Error("Failed to create order: " + orderError.message);
    }
    
    return { success: true, orderId: orderData.id };
  } catch (error: any) {
    console.error("Error creating order: ", error);
    throw new Error(error.message || "Failed to create order");
  }
}
