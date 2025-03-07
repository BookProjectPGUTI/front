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
	}
  
	.menu {
	  display: flex;
	  gap: 10px;
	  margin-bottom: 20px;
	}
  
	.menu-item {
	  padding: 10px 15px;
	  background: rgb(42, 45, 47);
	  border-radius: 8px;
	  text-decoration: none;
	  color:  rgba(173, 166, 156, 1);
	}
  
	.menu-item:hover {
	  background: rgb(50, 53, 55); 
	}
  
	.content {
	  background: rgb(42, 45, 47); 
	  color:  rgba(173, 166, 156, 1);
	  padding: 20px;
	  border-radius: 10px;
	  max-width: 800px;
	  width: 100%;
	  text-align: center;
	}
  </style>
  