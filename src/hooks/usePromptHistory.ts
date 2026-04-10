import { useState, useEffect } from "react";
import type { HistoryItem } from "@/components/PromptHistory";

const STORAGE_KEY = "promptvision_history";

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (imagePreview: string, prompt: string, style: string) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      imagePreview,
      prompt,
      style,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = () => setItems([]);

  return { items, addItem, deleteItem, clearAll };
}
