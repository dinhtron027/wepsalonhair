import type { QueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { queryKeys } from "./adminApi";
import { API_BASE_URL } from "./runtimeConfig";

type RealtimeEventName =
  | "service_created"
  | "service_updated"
  | "service_deleted"
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "booking_created"
  | "booking_updated"
  | "order_created"
  | "inventory_updated";

type RealtimeCallback = (eventName: RealtimeEventName) => void;

let socketInstance: Socket | null = null;
let activeToken = "";

const eventToInvalidationKeys: Record<RealtimeEventName, ReadonlyArray<readonly unknown[]>> = {
  service_created: [queryKeys.publicServices, queryKeys.adminServices, queryKeys.adminStats],
  service_updated: [queryKeys.publicServices, queryKeys.adminServices, queryKeys.adminStats],
  service_deleted: [queryKeys.publicServices, queryKeys.adminServices, queryKeys.adminStats],
  product_created: [
    queryKeys.publicProducts,
    queryKeys.adminProducts,
    queryKeys.adminInventory,
    queryKeys.adminStats,
  ],
  product_updated: [
    queryKeys.publicProducts,
    queryKeys.adminProducts,
    queryKeys.adminInventory,
    queryKeys.adminStats,
  ],
  product_deleted: [queryKeys.publicProducts, queryKeys.adminProducts, queryKeys.adminStats],
  booking_created: [queryKeys.adminBookings, queryKeys.adminStats, queryKeys.bookingSlots],
  booking_updated: [queryKeys.adminBookings, queryKeys.adminStats, queryKeys.bookingSlots],
  order_created: [queryKeys.adminOrders, queryKeys.adminStats, queryKeys.adminInventory],
  inventory_updated: [queryKeys.adminInventory, queryKeys.adminProducts, queryKeys.publicProducts],
};

export const connectSocket = (token: string | null) => {
  const normalizedToken = token || "";
  if (socketInstance && activeToken === normalizedToken) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  activeToken = normalizedToken;

  socketInstance = io(API_BASE_URL, {
    auth: normalizedToken
      ? {
          token: `Bearer ${normalizedToken}`,
        }
      : {},
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (!socketInstance) {
    return;
  }

  socketInstance.disconnect();
  socketInstance = null;
  activeToken = "";
};

export const setupRealtimeInvalidation = (
  queryClient: QueryClient,
  onRealtimeEvent?: RealtimeCallback
) => {
  if (!socketInstance) {
    return () => {};
  }

  const listeners = (Object.keys(eventToInvalidationKeys) as RealtimeEventName[]).map((eventName) => {
    const handler = () => {
      eventToInvalidationKeys[eventName].forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [...queryKey] });
      });

      onRealtimeEvent?.(eventName);
    };

    socketInstance?.on(eventName, handler);
    return { eventName, handler };
  });

  return () => {
    listeners.forEach(({ eventName, handler }) => {
      socketInstance?.off(eventName, handler);
    });
  };
};

export const getSocket = () => socketInstance;
