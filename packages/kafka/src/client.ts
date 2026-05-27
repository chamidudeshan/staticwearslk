import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'static-wears',
  brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
});
