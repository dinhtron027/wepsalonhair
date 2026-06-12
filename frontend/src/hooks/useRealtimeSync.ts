import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  setupRealtimeInvalidation,
} from "../services/socket";

const getRealtimeMessage = (eventName: string) => {
  if (eventName === "booking_created") {
    return "Lịch vừa được đặt";
  }

  if (eventName.startsWith("product_")) {
    return "Sản phẩm vừa thay đổi";
  }

  return "Có cập nhật mới";
};

export const useRealtimeSync = (enabled = true) => {
  const token = useAuth((state) => state.token);
  const queryClient = useQueryClient();
  const lastConnectErrorToastAt = useRef(0);

  useEffect(() => {
    if (!enabled || !token) {
      disconnectSocket();
      return;
    }

    connectSocket(token);

    const teardownInvalidation = setupRealtimeInvalidation(queryClient, (eventName) => {
      toast(getRealtimeMessage(eventName));
    });

    const socket = getSocket();
    const onConnect = () => {
      lastConnectErrorToastAt.current = 0;
    };

    const onConnectError = () => {
      const now = Date.now();
      if (now - lastConnectErrorToastAt.current < 15000) {
        return;
      }

      lastConnectErrorToastAt.current = now;
      toast.error("Kết nối realtime thất bại");
    };

    socket?.on("connect", onConnect);
    socket?.on("connect_error", onConnectError);

    return () => {
      teardownInvalidation();
      socket?.off("connect", onConnect);
      socket?.off("connect_error", onConnectError);
      disconnectSocket();
    };
  }, [enabled, token, queryClient]);
};
