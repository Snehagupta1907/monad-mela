export type SwapRequest = {
  id: string;
  fromToken: string;
  toToken: string;
  amount: string;
  note?: string;
  createdAt: number;
};

const STORAGE_KEY = "bloomfi.swapRequests";

function readStore(): SwapRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SwapRequest[]) : [];
  } catch {
    return [];
  }
}

function writeStore(items: SwapRequest[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listSwapRequests(): SwapRequest[] {
  return readStore().sort((a, b) => b.createdAt - a.createdAt);
}

export function addSwapRequest(partial: Omit<SwapRequest, "id" | "createdAt">): SwapRequest {
  const item: SwapRequest = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    ...partial,
  };
  const items = readStore();
  items.push(item);
  writeStore(items);
  return item;
}

export function removeSwapRequest(id: string): void {
  const items = readStore().filter((i) => i.id !== id);
  writeStore(items);
}
