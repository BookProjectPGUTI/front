<script lang="ts">
  import Login from "$lib/components/Login.svelte";
  import { writable } from "svelte/store";
  import { onMount } from 'svelte';
  import { fetchWithRefresh, clearRefreshTimer } from '$lib/auth';
  import { userStore, API_BASE_URL } from '$lib/stores'; 

  let isLoginOpen = writable(false);
  let userLoaded = false;

  onMount(async () => {
    try {
      const response = await fetchWithRefresh(`${API_BASE_URL}/users/me`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        userStore.set(data); 
      } else {
        userStore.set(null); 
      }
    } catch (err) {
      console.error("Ошибка при проверке авторизации:", err);
      userStore.set(null);
    } finally {
      userLoaded = true;
    }

  });

  const handleLogout = async () => {
    try {
      const response = await fetchWithRefresh(`${API_BASE_URL}/auth/sign-out`, {
        method: "DELETE",
      });

      if (response.status === 204) {
        userStore.set(null); 
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
    {#if $userStore}
      <span>{$userStore.username}</span>
      <button on:click={handleLogout}>Выйти</button>
    {:else}
      <a href="/signup">Регистрация</a>
      <button on:click={() => isLoginOpen.set(true)}>Войти</button>
    {/if}
  </nav>
</header>

<Login bind:isOpen={isLoginOpen} />

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
