import { useEffect, useMemo, useState } from "react";
import { lessons, storePool } from "./data";

export type EquippedItems = {
  hat?: string;
  avatar?: string;
  theme?: string;
  taunts?: string;
};

type StoreItem = (typeof storePool)[number];

export type GameState = {
  coins: number;
  xp: number;
  level: number;
  streak: number;
  sound: boolean;
  difficulty: "easy" | "medium" | "hard";
  completedLessons: string[];
  badges: string[];
  ownedItems: string[];
  equippedItems: EquippedItems;
  nextStoreRefreshAt: number;
  storeSeed: number;
  lastLoginDate: string;
};

const STORE_INTERVAL_MS = 5 * 60 * 1000;
const todayKey = () => new Date().toISOString().slice(0, 10);

const defaultState: GameState = {
  coins: 120,
  xp: 0,
  level: 1,
  streak: 1,
  sound: true,
  difficulty: "easy",
  completedLessons: [],
  badges: [],
  ownedItems: [],
  equippedItems: {},
  nextStoreRefreshAt: Date.now() + STORE_INTERVAL_MS,
  storeSeed: 7,
  lastLoginDate: todayKey(),
};

const storageKey = "mathduel-game-state-v1";

function normalizeState(state: GameState): GameState {
  const today = todayKey();
  if (state.lastLoginDate === today) return state;

  const last = new Date(`${state.lastLoginDate}T00:00:00`).getTime();
  const now = new Date(`${today}T00:00:00`).getTime();
  const dayGap = Math.round((now - last) / 86_400_000);
  const nextStreak = dayGap === 1 ? state.streak + 1 : 1;
  const bonus = 20 + Math.min(nextStreak, 14) * 3;

  return {
    ...state,
    streak: nextStreak,
    coins: state.coins + bonus,
    lastLoginDate: today,
  };
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultState;
    return normalizeState({ ...defaultState, ...JSON.parse(raw) });
  } catch {
    return defaultState;
  }
}

function seededIndex(seed: number, position: number, length: number) {
  const x = Math.sin(seed * 97 + position * 131) * 10000;
  return Math.abs(Math.floor(x)) % length;
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadState);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const storeItems = useMemo(() => {
    const now = Date.now();
    let seed = state.storeSeed;
    if (now >= state.nextStoreRefreshAt) seed += Math.ceil((now - state.nextStoreRefreshAt) / STORE_INTERVAL_MS) + 1;
    const items: StoreItem[] = [];
    const used = new Set<string>();
    const powerUps = storePool.filter((item) => item.type === "Power-up");
    const cosmetics = storePool.filter((item) => item.type !== "Power-up");
    for (let index = 0; items.length < 2 && index < powerUps.length * 2; index += 1) {
      const item = powerUps[seededIndex(seed, index, powerUps.length)];
      if (!used.has(item.id)) {
        items.push(item);
        used.add(item.id);
      }
    }
    for (let index = 0; items.length < 6 && index < storePool.length * 3; index += 1) {
      const pool = items.length < 4 ? cosmetics : storePool;
      const item = pool[seededIndex(seed + 3, index, pool.length)];
      if (!used.has(item.id)) {
        items.push(item);
        used.add(item.id);
      }
    }
    return items;
  }, [state.nextStoreRefreshAt, state.storeSeed]);

  const update = (patch: Partial<GameState> | ((current: GameState) => GameState)) => {
    setState((current) => (typeof patch === "function" ? patch(current) : { ...current, ...patch }));
  };

  const refreshStoreIfNeeded = () => {
    update((current) => {
      if (Date.now() < current.nextStoreRefreshAt) return current;
      return {
        ...current,
        storeSeed: current.storeSeed + 1,
        nextStoreRefreshAt: Date.now() + STORE_INTERVAL_MS,
      };
    });
  };

  const award = (coins: number, xp: number) => {
    update((current) => {
      const nextXp = current.xp + xp;
      const nextLevel = Math.max(current.level, Math.floor(nextXp / 100) + 1);
      return { ...current, coins: current.coins + coins, xp: nextXp, level: nextLevel };
    });
  };

  const completeLesson = (lessonId: string) => {
    const lesson = lessons.find((item) => item.id === lessonId);
    if (!lesson) return;
    update((current) => {
      if (current.completedLessons.includes(lessonId)) return current;
      const nextXp = current.xp + 40;
      return {
        ...current,
        coins: current.coins + lesson.reward,
        xp: nextXp,
        level: Math.max(current.level, Math.floor(nextXp / 100) + 1),
        completedLessons: [...current.completedLessons, lessonId],
        badges: [...new Set([...current.badges, lesson.badge])],
      };
    });
  };

  const buyItem = (itemId: string, price: number) => {
    let bought = false;
    update((current) => {
      if (current.ownedItems.includes(itemId) || current.coins < price) return current;
      bought = true;
      return { ...current, coins: current.coins - price, ownedItems: [...current.ownedItems, itemId] };
    });
    return bought;
  };

  const equipItem = (itemId: string) => {
    const item = storePool.find((entry) => entry.id === itemId);
    if (!item || item.type === "Power-up") return;

    update((current) => {
      if (!current.ownedItems.includes(itemId)) return current;
      const slot = item.type === "Hat" ? "hat" : item.type === "Theme" ? "theme" : item.type === "Taunts" ? "taunts" : "avatar";
      return {
        ...current,
        equippedItems: {
          ...current.equippedItems,
          [slot]: itemId,
        },
      };
    });
  };

  const reset = () => setState({ ...defaultState, nextStoreRefreshAt: Date.now() + STORE_INTERVAL_MS });

  return { state, storeItems, update, award, completeLesson, buyItem, equipItem, reset, refreshStoreIfNeeded };
}
