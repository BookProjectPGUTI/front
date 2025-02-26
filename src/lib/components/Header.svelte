<script lang="ts">
  import Login from "$lib/components/Login.svelte";
  
  import { writable } from "svelte/store";

  let isLoginOpen = writable(false);
</script>

<header>
  <a href="/"> <div class="logo" >Логотип</div></a> 
  <nav>
    
    <a href="/signup">Регистрация</a>
    <button on:click={() => isLoginOpen.set(true)}>Войти</button>
  </nav>
</header>

<Login bind:isOpen={isLoginOpen} />

<style>
  header {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
    background: rgba(24, 26, 27, 1);  /* Ваш желаемый цвет фона */
    color: rgba(173, 166, 156, 1);    /* Цвет текста */
    border-radius: 10px;
  }

  a {
    text-decoration: none;
    color: rgba(173, 166, 156, 1);  /* Цвет ссылок */
    margin: 0 1rem;
    font-size: 1.1rem;
  }

  button {
    background-color: rgba(0, 86, 179);  /* Цвет кнопки */
    color: rgba(18,18,18);
    border: none;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: rgba(173, 166, 156, 0.8);  /* Темнее при наведении */
  }
</style>
