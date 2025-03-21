import { writable } from 'svelte/store';

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