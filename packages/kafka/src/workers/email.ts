import { kafka } from '../client';
import { TOPICS } from '../topics';
import type { OrderPlacedEvent, OrderStatusChangedEvent, StockLowEvent } from '../types';
import { sendOrderConfirmation, sendShippingUpdate, sendLowStockAlert } from '@static-wears/email-service';

const consumer = kafka.consumer({ groupId: 'email-service' });

async function run() {
  await consumer.connect();
  await consumer.subscribe({
    topics: [TOPICS.ORDER_PLACED, TOPICS.ORDER_STATUS_CHANGED, TOPICS.STOCK_LOW],
    fromBeginning: false,
  });

  console.log('[email-worker] Connected to Kafka — listening for events');

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) return;
      const event = JSON.parse(message.value.toString());

      try {
        if (topic === TOPICS.ORDER_PLACED) {
          const e = event as OrderPlacedEvent;
          const { error } = await sendOrderConfirmation({
            to: e.to,
            customerName: e.customerName,
            orderId: e.orderId,
            items: e.items,
            total: e.total,
            shippingAddress: e.shippingAddress,
          });
          if (error) throw new Error(error);
          console.log(`[email-worker] Order confirmation sent → ${e.to} (${e.orderId})`);

        } else if (topic === TOPICS.ORDER_STATUS_CHANGED) {
          const e = event as OrderStatusChangedEvent;
          const { error } = await sendShippingUpdate({
            to: e.to,
            customerName: e.customerName,
            orderId: e.orderId,
            status: e.status,
          });
          if (error) throw new Error(error);
          console.log(`[email-worker] Shipping update sent → ${e.to} — ${e.status}`);

        } else if (topic === TOPICS.STOCK_LOW) {
          const e = event as StockLowEvent;
          const { error } = await sendLowStockAlert({ items: e.items });
          if (error) throw new Error(error);
          console.log(`[email-worker] Low stock alert sent — ${e.items.length} variant(s)`);
        }
      } catch (err) {
        console.error(`[email-worker] Failed to process ${topic}:`, err);
      }
    },
  });
}

run().catch((err) => {
  console.error('[email-worker] Fatal error:', err);
  process.exit(1);
});
