<script lang="ts">
  import Login from "$lib/components/Login.svelte";
  import { writable } from "svelte/store";
   import logo from '$lib/images/log.png'
  let isLoginOpen = writable(false);
</script>

<header>
  <a href="/">
    <div class="logo">
      <img src={logo} alt="Логотип" />
    </div>
    
  </a>
      
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
    background: rgb(255, 255, 255);
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
    background: #00aaff;
    color: rgb(255, 255, 255);
    border: none;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease;
  }

  .styled-btn:hover {
    background: #00aaff;
    transform: scale(1.05);
  }

  /* Оранжевая неоновая линия */
  .neon-line {
    width: 100%;
    height: 4px;
    background: #00aaff;
    box-shadow: 0 0 10px #00aaff, 0 0 20px #00aaff;
    animation: neonGlow 1.5s infinite alternate;
  }

  @keyframes neonGlow {
    0% {
      box-shadow: 0 0 5px #00aaff, 0 0 10px #00aaff;
    }
    100% {
      box-shadow: 0 0 15px #00aaff, 0 0 30px #00aaff;
    }
  }
  .logo {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* Устанавливаем высоту, чтобы картинка не нарушала структуру хедера */
 
}
  .logo img {
  max-width: 30%;
  height: auto;
  margin-left: -10px
}
</style>
