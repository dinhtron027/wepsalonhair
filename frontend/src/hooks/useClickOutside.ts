import { useEffect, useRef } from "react";

/**
 * Hook xử lý click bên ngoài element để đóng dropdown/menu.
 * Tái sử dụng được cho bất kỳ component nào.
 */
export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
  enabled = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // Dùng mousedown thay vì click để phản hồi nhanh hơn
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [callback, enabled]);

  return ref;
}
