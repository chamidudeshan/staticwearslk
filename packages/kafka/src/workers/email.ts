import { kafka } from '../client';
import { TOPICS } from '../topics';
import type { OrderPlacedEvent, OrderStatusChangedEvent } from '../types';
import { sendOrderConfirmation, sendShippingUpdate } from '@static-wears/email-service';

const consumer = kafka.consumer({ groupId: 'email-service' });

async function run() {
  await consumer.connect();
  await consumer.subscribe({
    topics: [TOPICS.ORDER_PLACED, TOPICS.ORDER_STATUS_CHANGED],
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
          await sendOrderConfirmation({
            to: e.to,
            customerName: e.customerName,
            orderId: e.orderId,
            items: e.items,
            total: e.total,
            shippingAddress: e.shippingAddress,
          });
          console.log(`[email-worker] Order confirmation sent for ${e.orderId}`);
        } else if (topic === TOPICS.ORDER_STATUS_CHANGED) {
          const e = event as OrderStatusChangedEvent;
          await sendShippingUpdate({
            to: e.to,
            customerName: e.customerName,
            orderId: e.orderId,
            status: e.status,
          });
          console.log(`[email-worker] Shipping update sent for ${e.orderId} — ${e.status}`);
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
