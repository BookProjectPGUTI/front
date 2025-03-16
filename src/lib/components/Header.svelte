<script lang="ts">
  import Login from "$lib/components/Login.svelte";
  import { writable } from "svelte/store";

  let isLoginOpen = writable(false);
</script>

<header>
  <a href="/"> <div class="logo">Логотип</div></a>
      
  <nav>
    <a href="/signup" class="styled-btn">Регистрация</a>
    <button class="styled-btn" on:click={() => isLoginOpen.set(true)}>Войти</button>
  </nav>
</header>

<!-- Оранжевая неоновая полоска -->
<div class="neon-line"></div>

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

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: rgba(173, 166, 156, 1);
  }

  nav {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .styled-btn {
    display: inline-block;
    text-decoration: none;
    background: rgb(232, 121, 62);
    color: rgba(18, 18, 18, 1);
    border: none;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease;
  }

  .styled-btn:hover {
    background: rgb(255, 140, 78);
    transform: scale(1.05);
  }

  /* Оранжевая неоновая линия */
  .neon-line {
    width: 100%;
    height: 4px;
    background: rgb(232, 121, 62);
    box-shadow: 0 0 10px rgb(232, 121, 62), 0 0 20px rgb(232, 121, 62);
    animation: neonGlow 1.5s infinite alternate;
  }

  @keyframes neonGlow {
    0% {
      box-shadow: 0 0 5px rgb(232, 121, 62), 0 0 10px rgb(232, 121, 62);
    }
    100% {
      box-shadow: 0 0 15px rgb(232, 121, 62), 0 0 30px rgb(232, 121, 62);
    }
  }
  .logo img {
  max-width: 100%;
  height: auto;
}
</style>
