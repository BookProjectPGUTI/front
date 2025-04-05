import { writable } from 'svelte/store';
import { page } from '$app/stores';

export const currentPath = {
  subscribe: page.subscribe,
  get() {
      let $path;
      page.subscribe(p => $path = p.url.pathname)();
      return $path;
  }
};

export function isActive(path: string): boolean {
  return currentPath.get() === path;
}

type User = {
    id: string;
    first_name: string;
    last_name: string;
    second_name: string;
    email: string;
    username: string;
    rating: number;
  };

export const userStore = writable<User | null>(null);

export const isLoginOpen = writable(false); 

export const API_BASE_URL = "api/v1";
