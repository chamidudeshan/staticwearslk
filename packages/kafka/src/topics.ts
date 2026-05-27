export const TOPICS = {
  ORDER_PLACED: 'order.placed',
  ORDER_STATUS_CHANGED: 'order.status.changed',
} as const;

export type Topic = (typeof TOPICS)[keyof typeof TOPICS];
