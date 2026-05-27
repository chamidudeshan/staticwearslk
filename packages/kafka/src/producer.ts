import { kafka } from './client';
import type { Topic } from './topics';
import type { KafkaEventPayload } from './types';

const producer = kafka.producer();

let connected = false;

export async function publishEvent(topic: Topic, payload: KafkaEventPayload): Promise<void> {
  if (!connected) {
    await producer.connect();
    connected = true;
  }
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }],
  });
}
