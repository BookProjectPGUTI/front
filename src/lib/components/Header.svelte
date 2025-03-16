<script lang="ts">
  import Login from "$lib/components/Login.svelte";
  import { writable } from "svelte/store";
  import { onMount } from 'svelte';
  import { fetchWithRefresh, clearRefreshTimer } from '$lib/auth';

  let isLoginOpen = writable(false);
  let user = writable<{ id: string; username: string; email: string } | null>(null);
  onMount(async () => {
    try {
      const response = await fetchWithRefresh("http://localhost:8000/api/v1/users/me", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        user.set(data); 
      } else {
        user.set(null);
      }
    } catch (err) {
      console.error("Ошибка при проверке авторизации:", err);
      user.set(null);
    }
  });
  const handleLogout = async () => {
    try {
      const response = await fetchWithRefresh("http://localhost:8000/api/v1/auth/sign-out", {
        method: "DELETE",
      });

      if (response.status === 204) {
        user.set(null); 
        clearRefreshTimer();
      } else {
        const data = await response.json();
        throw new Error(data.details || "Ошибка при выходе из аккаунта.");
      }
    } catch (err: any) {
      console.error(err.message);
    }
  };
</script>

<header>
  <a href="/"> <div class="logo">Логотип</div></a> 
  <nav>
    {#if $user}
      <span>{$user.username}</span>
      <button on:click={handleLogout}>Выйти</button>
    {:else}
      <a href="/signup">Регистрация</a>
      <button on:click={() => isLoginOpen.set(true)}>Войти</button>
    {/if}
  </nav>
</header>

<Login bind:isOpen={isLoginOpen} bind:user={user} />

<style>
  header {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
    background: rgba(24, 26, 27, 1);  
    color: rgba(173, 166, 156, 1);  
    border-radius: 10px;
  }

  a {
    text-decoration: none;
    color: rgba(173, 166, 156, 1); 
    margin: 0 1rem;
    font-size: 1.1rem;
  }

  button {
    background-color: rgba(0, 86, 179);
    color: rgba(18,18,18);
    border: none;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: rgba(173, 166, 156, 0.8);
  }
</style>