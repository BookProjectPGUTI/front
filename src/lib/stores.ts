// stores.ts
import { writable } from 'svelte/store';

export const user = writable<{ id: string; username: string; email: string } | null>(null);
export const isLoginOpen = writable(false); // Добавляем isLoginOpen