export const MESSAGE_BUS_PORT = Symbol('MESSAGE_BUS_PORT');

export interface MessageBusPort {
  publish(queue: string, payload: unknown): Promise<void>;
}
