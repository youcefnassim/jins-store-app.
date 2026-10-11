/**
 * Discord Webhook integration for Jin Store
 * Sends rich notifications directly to admin's Discord channel for new orders and auto topups.
 */

interface DiscordOrderNotification {
  orderId: string;
  game: string;
  package: string;
  playerId: string;
  price: string;
  paymentMethod?: string;
  receiptUrl?: string;
  customerEmail?: string;
}

interface DiscordTopupNotification {
  orderId: string;
  game: string;
  package: string;
  playerId: string;
  provider: string;
  transactionId: string;
  status: string;
}

export async function sendDiscordOrderNotification(order: DiscordOrderNotification): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const embed = {
      title: '🛒 Nouvelle Commande Reçue — Jin Store',
      color: 0x3b82f6, // Blue
      fields: [
        { name: '🎮 Jeu', value: order.game || 'N/A', inline: true },
        { name: '📦 Pack', value: order.package || 'N/A', inline: true },
        { name: '💰 Prix', value: order.price || 'N/A', inline: true },
        { name: '🆔 ID Joueur', value: `\`${order.playerId}\``, inline: true },
        { name: '💳 Paiement', value: order.paymentMethod || 'BaridiMob / Reçu', inline: true },
        { name: '📄 ID Commande', value: `\`${order.orderId.slice(0, 8)}\``, inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'Jin Store Notification Bot' },
    };

    if (order.receiptUrl && order.receiptUrl.startsWith('http')) {
      // Add receipt as thumbnail or link
      (embed as any).image = { url: order.receiptUrl };
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🚨 **Nouvelle commande de recharge à traiter !**`,
        embeds: [embed],
      }),
    });

    return true;
  } catch (err) {
    console.error('Discord webhook notification error:', err);
    return false;
  }
}

export async function sendDiscordTopupDelivered(topup: DiscordTopupNotification): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const embed = {
      title: '⚡ Recharge Livrée avec Succès !',
      color: 0x10b981, // Emerald green
      fields: [
        { name: '🎮 Jeu', value: topup.game, inline: true },
        { name: '📦 Pack', value: topup.package, inline: true },
        { name: '👤 ID Joueur', value: `\`${topup.playerId}\``, inline: true },
        { name: '🏢 Fournisseur', value: topup.provider, inline: true },
        { name: '🔖 N° Transaction', value: `\`${topup.transactionId}\``, inline: true },
        { name: '✅ Statut', value: 'Livré automatiquement', inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'Système de Recharge Automatique Jin Store' },
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🎉 **Recharge automatique validée et livrée au joueur !**`,
        embeds: [embed],
      }),
    });

    return true;
  } catch (err) {
    console.error('Discord topup webhook error:', err);
    return false;
  }
}
