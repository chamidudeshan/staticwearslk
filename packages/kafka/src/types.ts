export interface OrderPlacedEvent {
  orderId: string;
  to: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  shippingAddress: string;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  to: string;
  customerName: string;
  status: string;
}

export type KafkaEventPayload = OrderPlacedEvent | OrderStatusChangedEvent;
