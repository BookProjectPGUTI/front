<script lang="ts">
  let activeTab = 'offers'; 
  let exchangeMakers = [];
  let currentExchange = null;
  let isLoading = false; 
  let isMaker = false; 
  let isTaker = false; 

  let currentUser = {
    id: 1, 
    username: 'User123', 
    rating: 4.7,
  };

  async function fetchExchangeMakers() {
    isLoading = true;
    try {
      const response = await fetch('/v1/exchanges/makers');
      if (response.ok) {
        exchangeMakers = await response.json();
      } else {
        console.error('Ошибка при загрузке предложений на обмен');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      isLoading = false;
    }
  }

  async function fetchCurrentExchange() {
    isLoading = true;
    try {
      const response = await fetch('/v1/exchanges/current');
      if (response.ok) {
        currentExchange = await response.json();
        isTaker = currentExchange.role === 'taker';
        isMaker = currentExchange.role === 'maker';
      } else {
        console.error('Ошибка при загрузке активных обменов');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      isLoading = false;
    }
  }

  async function becomeMaker() {
    isLoading = true;
    try {
      const response = await fetch('/v1/exchanges/makers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      if (response.ok) {
        isMaker = true;
        alert('Теперь вы мейкер. Вы будете отображаться у других пользователей.');
      } else {
        console.error('Ошибка при попытке стать мейкером');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      isLoading = false;
    }
  }

  async function cancelMaker() {
    isLoading = true;
    try {
      const response = await fetch('/v1/exchanges', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      if (response.ok) {
        isMaker = false;
        alert('Вы больше не мейкер.');
      } else {
        console.error('Ошибка при отмене поиска партнера');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      isLoading = false;
    }
  }

  async function becomeTaker(makerId) {
    isLoading = true;
    try {
      const response = await fetch('/v1/exchanges/takers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.id, makerId }),
      });
      if (response.ok) {
        isTaker = true;
        alert('Теперь вы тейкер. Ожидайте подтверждения обмена.');
      } else {
        console.error('Ошибка при попытке стать тейкером');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      isLoading = false;
    }
  }

  async function cancelTaker() {
    isLoading = true;
    try {
      const response = await fetch('/v1/exchanges', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      if (response.ok) {
        isTaker = false;
        alert('Вы больше не тейкер.');
      } else {
        console.error('Ошибка при отмене обмена');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      isLoading = false;
    }
  }

  async function acceptExchange() {
    isLoading = true;
    try {
      const response = await fetch('/v1/exchanges/makers/accept', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      if (response.ok) {
        alert('Обмен подтвержден. Данные больше нельзя изменить.');
      } else {
        console.error('Ошибка при подтверждении обмена');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      isLoading = false;
    }
  }

  fetchExchangeMakers();

  function handleTabChange(tab) {
    activeTab = tab;
    if (tab === 'offers') {
      fetchExchangeMakers(); 
    } else if (tab === 'active') {
      fetchCurrentExchange();
    }
  }
</script>

<main class="container">
  <nav class="menu">
    <a href="/" class="menu-item">Главная</a>
    <a href="/exchange" class="menu-item">Начать обмен</a>
    <a href="/my-exchanges" class="menu-item">Мои обмены</a>
  </nav>

  <div class="layout">
    <!-- Сайдбар -->
    <aside class="sidebar">
      <!-- Информация о пользователе -->
      <div class="user-info">
        <p class="username">{currentUser.username}</p>
        <p class="rating">Рейтинг: {currentUser.rating}</p>
      </div>

      <!-- Кнопки сайдбара -->
      <button class="sidebar-item {activeTab === 'offers' ? 'active' : ''}" on:click={() => handleTabChange('offers')}>Предложения на обмен</button>
      <button class="sidebar-item {activeTab === 'active' ? 'active' : ''}" on:click={() => handleTabChange('active')}>Активные обмены</button>
    </aside>

    <!-- Основной контент -->
    <section class="content">
      {#if isLoading}
        <p>Загрузка...</p>
      {:else}
        {#if activeTab === 'offers'}
          <div class="exchange-offers">
            <h2>Предложения на обмен</h2>
            {#if !isMaker && !isTaker}
              <button on:click={becomeMaker} class="action-button">Ожидать пару</button>
            {:else if isMaker}
              <p class="status-message">Вы мейкер. Ожидайте предложений.</p>
            {:else if isTaker}
              <p class="status-message">Вы тейкер. Ожидайте подтверждения обмена.</p>
            {/if}
            <div class="exchange-list">
              {#each exchangeMakers as maker}
                <div class="exchange-item">
                  <p>Username: {maker.username}</p>
                  <p>Имя: {maker.firstName} {maker.lastName}</p>
                  <p>Рейтинг: {maker.rating}</p>
                  <p>Книга: {maker.book.title}</p>
                  <p>Совпадения по жанрам: {maker.matchingGenres.join(', ')}</p>
                  <p>Общие жанры: {maker.commonGenres.join(', ')}</p>
                  {#if !isTaker && !isMaker}
                    <button on:click={() => becomeTaker(maker.id)} class="action-button">Выбрать для обмена</button>
                  {/if}
                </div>
              {:else}
                <p>Нет доступных предложений для обмена.</p>
              {/each}
            </div>
          </div>
        {:else}
          <div class="active-exchanges">
            <h2>Активные обмены</h2>
            {#if currentExchange}
              <div class="exchange-item">
                <p>Текущий обмен: {currentExchange.role === 'taker' ? 'Вы тейкер' : 'Вы мейкер'}</p>
                <p>Книга: {currentExchange.book.title}</p>
                <p>Пользователь: {currentExchange.user.username}</p>
                {#if isMaker}
                  <button on:click={acceptExchange} class="action-button">Подтвердить обмен</button>
                  <button on:click={cancelMaker} class="action-button">Остановить поиск</button>
                {:else if isTaker}
                  <button on:click={cancelTaker} class="action-button">Отказаться от обмена</button>
                {/if}
              </div>
            {:else}
              <p>Нет активных обменов</p>
            {/if}
          </div>
        {/if}
      {/if}
    </section>
  </div>
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

  .layout {
    display: flex;
    width: 100%;
    max-width: 1200px;
    gap: 20px;
  }

  .sidebar {
    width: 250px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: rgb(42, 45, 47);
    padding: 20px;
    border-radius: 10px;
  }

  .user-info {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(173, 166, 156, 0.2);
  }

  .username {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
    color: rgba(173, 166, 156, 1);
  }

  .rating {
    font-size: 14px;
    margin: 5px 0 0;
    color: rgba(173, 166, 156, 0.8);
  }

  .sidebar-item {
    padding: 10px 15px;
    background: rgb(50, 53, 55);
    border-radius: 8px;
    text-decoration: none;
    color:  rgba(173, 166, 156, 1);
    cursor: pointer;
    text-align: left;
    border: none;
  }

  .sidebar-item.active {
    background: rgb(60, 63, 65); 
  }

  .content {
    flex: 1;
    background: rgb(42, 45, 47);
    color:  rgba(173, 166, 156, 1);
    padding: 20px;
    border-radius: 10px;
  }

  .exchange-offers, .active-exchanges {
    margin-top: 20px;
  }

  .exchange-list, .exchange-item {
    margin-top: 10px;
  }

  .exchange-item {
    background: rgb(50, 53, 55);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .action-button {
    padding: 10px 15px;
    background: rgb(60, 63, 65);
    border: none;
    border-radius: 8px;
    color: rgba(173, 166, 156, 1);
    cursor: pointer;
    margin-top: 10px;
  }

  .action-button:hover {
    background: rgb(70, 73, 75);
  }

  .status-message {
    color: rgba(173, 166, 156, 1);
    font-style: italic;
  }
</style>