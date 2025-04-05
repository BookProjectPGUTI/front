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

  function redirectToSignup() {
    window.location.href = '/signup';
  }
</script>

<header>
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <a href="/" class="logo-link">
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="white">
      <path d="M151.4,143.6v14.2c0,0,0,0,0,0v0c0,0.8-0.2,1.4-0.8,2c-0.2,0.2-0.2,0.2-0.4,0.4c-0.4,0.4-1,0.6-1.6,0.6c0,0-0.2,0-0.2,0c0,0,0,0-0.2,0c-0.8,0-1.4-0.4-2-0.8L125.2,138.6c-1.2-1.2-1.2-3,0-4.2c1.2-1.2,3-1.2,4.2,0l16,16v-7c0-1.6,1.4-3,3-3S151.4,143,151.4,143.6z M123.6,140.2c-0.6-0.6-1.2-0.8-2-0.8c-0.2,0-0.2,0-0.4,0c-0.6,0-1.2,0.2-1.6,0.6c-0.2,0.2-0.4,0.2-0.4,0.4c-0.4,0.6-0.8,1.2-0.8,2v0c0,0,0,0,0,0v14.2c0,1.6,1.4,3,3,3s3-1.4,3-3v-7l16,16c0.6,0.6,1.4,0.8,2.2,0.8s1.6-0.2,2.2-0.8c1.2-1.2,1.2-3,0-4.2L123.6,140.2z M168,150c0,18.2-14.8,33-33,33S102,168.2,102,150s14.8-33,33-33S168,131.8,168,150z M162,150c0-14.8-12.2-27-27-27s-27,12.2-27,27s12.2,27,27,27S162,164.8,162,150z M37.4,16c-2.2,0-4,1.8-4,4s1.8,4,4,4h88.2c2.2,0,4-1.8,4-4s-1.8-4-4-4H37.4z M179,150c0,24.2-19.8,44-44,44C112,194,93.2,176.4,91.2,154H38.2c-9.4,0-17.2-7.2-17.2-16V20c0-7.8,6.8-14,15-14h99c2.2,0,4,1.8,4,4s-1.8,4-4,4H36c-3.8,0-7,2.6-7,6s3.2,6,7,6h99c2.2,0,4,1.8,4,4v76.2C161.4,108.2,179,127,179,150z M38.2,146h53c0.8-8,3.6-15.6,8.2-21.8H53.6v-8h52.8v0.4c6.8-5.8,15.2-9.6,24.6-10.4V34H36c-2.6,0-5-0.6-7-1.6V138C29,142.4,33.2,146,38.2,146z M171,150c0-19.8-16.2-36-36-36s-36,16.2-36,36s16.2,36,36,36S171,169.8,171,150z M62.8,63c0-9.6,7.8-17.2,17.2-17.2s17.2,7.8,17.2,17.2s-7.8,17.2-17.2,17.2S62.8,72.6,62.8,63z M70.8,63c0,5,4.2,9.2,9.2,9.2s9.2-4.2,9.2-9.2s-4.2-9.2-9.2-9.2S70.8,58,70.8,63z M106.4,113.8H53.6v-4c0-14.6,11.8-26.4,26.4-26.4s26.4,11.8,26.4,26.4V113.8z M98,105.8c-1.8-8.2-9.2-14.4-18-14.4s-16.2,6.2-18,14.4H98z"/>
    </svg>  </a> 
  <nav>
    {#if $userStore}
      <span class="username">{$userStore.username}</span>
      <button class="btn" on:click={handleLogout}>Выйти</button>
    {:else}
      <button class="btn" on:click={redirectToSignup}>Регистрация</button>
      <button class="btn" on:click={() => isLoginOpen.set(true)}>Войти</button>
    {/if}
  </nav>
</header>

<Login bind:isOpen={isLoginOpen} />

<style>
  header {
    display: flex;
    justify-content: space-between;
    padding: 25px 20px;
    background: #00aaff;
    color: white;
    align-items: center;
  }

  .logo-link {
    display: flex;
    align-items: center;
    height: 40px;
  }

  .logo-link svg {
    width: 80px;
    height: auto;
  }

  nav {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .username {
    color: white;
    margin-right: 10px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease;
    height: 36px;
    min-width: 100px;
    outline: none;
  }

  .btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }

  .btn::-moz-focus-inner {
    border: 0;
  }
  svg {
    fill: white;
  }
</style>