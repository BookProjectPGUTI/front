<script lang="ts">
  </script>
  
  <main class="container">
	<nav class="menu">
	  <a href="/" class="menu-item">Главная</a>
	  <a href="/exchange" class="menu-item">Начать обмен</a>
	  <a href="/my-exchanges" class="menu-item">Мои обмены</a>
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
	  background: #f9f9f9;
	  color: #333;
	  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}
  
	.menu {
	  display: flex;
	  gap: 10px;
	  margin-bottom: 20px;
	  background: #fff;
	}
  
	.menu-item {
	  padding: 10px 15px;
	  background: #fff;
	  border-radius: 8px;
	  text-decoration: none;
	  color: #333;
	  border: 1px solid #ccc;
	  cursor: pointer;
	  transition: background 0.3s, color 0.3s;
	}
  
	.menu-item:hover {
	  background: #eee;
	}
  
	.content {
	  background: #fff;
	  color: #333;
	  padding: 20px;
	  border-radius: 10px;
	  max-width: 800px;
	  width: 100%;
	  text-align: center;
	  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}
  </style>
  