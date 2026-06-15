export const TOPICS = {
  ORDER_PLACED: 'order.placed',
  ORDER_STATUS_CHANGED: 'order.status.changed',
  STOCK_LOW: 'stock.low',
} as const;

export type Topic = (typeof TOPICS)[keyof typeof TOPICS];
