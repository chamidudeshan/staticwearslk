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

export interface StockLowEvent {
  items: { productName: string; color: string; size: string; currentStock: number; threshold: number }[];
}

export type KafkaEventPayload = OrderPlacedEvent | OrderStatusChangedEvent | StockLowEvent;
