"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

const POSITION_STORAGE_KEY = "whatsapp-button-position";

interface Position {
  x: number;
  y: number;
}

const DEFAULT_POSITION: Position = { x: 0, y: 0 };

/**
 * Read stored position from localStorage
 */
function getStoredPosition(): Position {
  try {
    const saved = localStorage.getItem(POSITION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_POSITION;
  } catch {
    return DEFAULT_POSITION;
  }
}

/**
 * Save position to localStorage and dispatch storage event
 */
function savePosition(x: number, y: number): void {
  try {
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify({ x, y }));
    // Trigger storage event to notify other subscribers
    window.dispatchEvent(
      new StorageEvent("storage", { key: POSITION_STORAGE_KEY }),
    );
  } catch {
    // Ignore storage errors (e.g., private mode)
  }
}

export interface UseWhatsAppPositionReturn {
  /**
   * Current position (local state takes priority over stored)
   */
  position: Position;
  /**
   * Update local position state
   */
  setLocalPosition: (_position: Position | null) => void;
  /**
   * Save position to localStorage
   */
  persistPosition: (_x: number, _y: number) => void;
}

/**
 * Custom hook to manage WhatsApp button position with localStorage persistence.
 * Uses useSyncExternalStore to safely read localStorage avoiding SSR/hydration CLS.
 */
export function useWhatsAppPosition(): UseWhatsAppPositionReturn {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);

  const getSnapshot = useCallback(() => {
    return JSON.stringify(getStoredPosition());
  }, []);

  const getServerSnapshot = useCallback(() => {
    return JSON.stringify(DEFAULT_POSITION);
  }, []);

  const positionString = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const storedPosition = JSON.parse(positionString) as Position;

  const [localPosition, setLocalPosition] = useState<Position | null>(null);

  // Local drag position takes priority over stored position
  const position = localPosition ?? storedPosition;

  const persistPosition = useCallback((x: number, y: number) => {
    const newPosition = { x, y };
    setLocalPosition(newPosition);
    savePosition(x, y);
  }, []);

  return {
    position,
    setLocalPosition,
    persistPosition,
  };
}
