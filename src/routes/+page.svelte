<script lang="ts">
	import { onMount } from "svelte";
  </script>
  
  <main class="container">
	<nav class="menu">
	  <a href="/" class="menu-item">Главная</a>
	  <a href="/exchange" class="menu-item">Начать обмен</a>
	  <a href="/my-exchanges" class="menu-item">Мои обмены</a>
	  <a href="/faq" class="menu-item">Задать вопрос</a>
	</nav>
  
	<section class="content">
	  <p>Описание приложения, правила обмена, чем интересно - "сюрприз"...</p>
	</section>
  </main>
  
  <style>
	.container {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  padding: 20px;
	}
  
	.header {
	  display: flex;
	  justify-content: space-between;
	  width: 100%;
	  max-width: 1200px;
	  padding: 10px;
	  background: #f0f0f0;
	  border-radius: 10px;
	  margin-bottom: 20px;
	}
  
	.logo {
	  font-size: 20px;
	  font-weight: bold;
	}
  
	.nav a {
	  margin-left: 15px;
	  text-decoration: none;
	  color: #333;
	}
  
	.menu {
	  display: flex;
	  gap: 10px;
	  margin-bottom: 20px;
	}
  
	.menu-item {
	  padding: 10px 15px;
	  background: rgb(42, 45, 47); /* Цвет фона кнопок */
	  border-radius: 8px;
	  text-decoration: none;
	  color:  rgba(173, 166, 156, 1); /* Цвет текста на кнопках */
	}
  
	.menu-item:hover {
	  background: rgb(50, 53, 55); /* Цвет фона кнопок при наведении */
	}
  
	.content {
	  background: rgb(42, 45, 47); /* Цвет фона описания */
	  color:  rgba(173, 166, 156, 1); /* Цвет текста в блоке с описанием */
	  padding: 20px;
	  border-radius: 10px;
	  max-width: 800px;
	  width: 100%;
	  text-align: center;
	}
  </style>
  