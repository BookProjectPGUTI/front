<script lang="ts">
	  import { isActive } from '$lib/stores';
</script>

<main class="container">
	<nav class="menu">
		<a href="/" class="menu-item {isActive('/') ? 'active' : ''}">Главная</a>
		<a href="/exchange" class="menu-item {isActive('/exchange') ? 'active' : ''}">Начать обмен</a>
		<a href="/my-exchanges" class="menu-item {isActive('/my-exchanges') ? 'active' : ''}">Мои обмены</a>
	  </nav>

  <section class="content">
    <h1>Добро пожаловать в BookSwap!</h1>
    <p class="description">Сервис для любителей книг, где вы можете обмениваться книгами с другими читателями.</p>
    
    <div class="features">
      <div class="feature">
        <h2>📚 Бесконечное чтение</h2>
        <p>Получайте новые книги, отдавая те, что уже прочитали. Ваша библиотека будет постоянно обновляться!</p>
      </div>
      
      <div class="feature">
        <h2>💚 Экономия денег</h2>
        <p>Читайте больше, платите меньше. Обмен книгами - это бесплатно!</p>
      </div>
      
      <div class="feature">
        <h2>🌍 Экологично</h2>
        <p>Дарите книгам вторую жизнь и сокращайте экологический след от производства новых книг.</p>
      </div>
    </div>
    
    <div class="rules">
      <h2>Как это работает?</h2>
      <ol>
        <li>Добавьте книгу, которую готовы обменять.</li>
        <li>Выберите интересующие вас жанры и выберите в каталоге.</li>
        <li>Предложите обмен владельцу книги.</li>
        <li>Договоритесь о способе передачи по почте.</li>
        <li>Наслаждайтесь новыми книгами!</li>
      </ol>
    </div>
    
  </section>
</main>

<style>
	* {
	  box-sizing: border-box;
	}
	.container {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  padding: 20px;
	  color: #333;
	  font-family: 'Arial', sans-serif;
	}
  
	
	.menu {
	  display: flex;
	  gap: 15px;
	  margin-bottom: 20px;
	  background: #fff;
	  border-radius: 8px;
	  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}
  
	.menu-item {
	  padding: 10px 20px;
	  background: #fff;
	  border-radius: 8px;
	  text-decoration: none;
	  color: #333;
	  cursor: pointer;
	  transition: all 0.3s ease;
	  font-weight: 500;
	}
  
	.menu-item:hover {
	  background: #f0f0f0;
	  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}
  
	.menu-item.active {
	  background: #00aaff;
	  color: white;
	  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}
  
	.content {
	  background: #fff;
	  color: #333;
	  padding: 15px;
	  border-radius: 10px;
	  width: 800px;
	  text-align: center;
	  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	  max-height:display;
	  height: 750px;
	}
	
	h1 {
	  color: #2c3e50;
	  margin-bottom: 20px;
	}
	
	.description {
	  font-size: 1.1em;
	  margin-bottom: 30px;
	  color: #4a4a4a;
	}
	
	.features {
	  display: flex;
	  flex-wrap: wrap;
	  justify-content: space-between;
	  gap: 20px;
	  margin: 30px 0;
	}
	
	.feature {
	  flex: 1 1 250px;
	  padding: 20px;
	  background: #f9f9f9;
	  border-radius: 8px;
	  text-align: center;
	}
	
	.feature h2 {
	  color: #27ae60;
	  font-size: 1.2em;
	}
	
	.rules {
	  background: #e8f4fc;
	  padding: 20px;
	  border-radius: 8px;
	  text-align: left;
	}
	
	.rules h2 {
	  text-align: center;
	  color: #2980b9;
	}
	
	.rules ol {
	  padding-left: 20px;
	}
	
	.rules li {
	  margin-bottom: 10px;
	}
  </style>