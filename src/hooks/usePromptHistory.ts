import { useState, useEffect } from "react";
import type { HistoryItem } from "@/components/PromptHistory";

const STORAGE_KEY = "promptvision_history";
const MAX_ITEMS = 10;

export function usePromptHistory() {
  const [items, setItems] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const toSave = items.slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn("Could not save history to localStorage:", e);
      // Try saving with fewer items
      try {
        const fewer = items.slice(0, 3);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fewer));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [items]);

  const addItem = (imagePreview: string, prompt: string, style: string) => {
    // Compress image to thumbnail to save space
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.onload = () => {
      const maxDim = 200;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL("image/jpeg", 0.6);

      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        imagePreview: thumbnail,
        prompt,
        style,
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev].slice(0, MAX_ITEMS));
    };
    img.src = imagePreview;
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { items, addItem, deleteItem, clearAll };
}
