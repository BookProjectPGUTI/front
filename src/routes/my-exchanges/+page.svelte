<script lang="ts">
  import { userStore, API_BASE_URL } from '$lib/stores'; 
  import { onMount } from 'svelte';

  let activeTab = 'offers'; 
  let exchangeMakers: any[] = [];
  let currentExchange: any = null;
  let isLoading = false; 
  let isMaker = false; 
  let isTaker = false; 
  let isInitialLoad = true;
  let selectedMakerId: string | null = null;

  let currentUser: any;
  let isFirstLoad = true;
  let unsubscribe: () => void;

  async function loadInitialData() {
    await checkUserStatus();
    if (!isMaker) {
      await fetchExchangeMakers();
    }
  }

  onMount(() => {
    unsubscribe = userStore.subscribe(user => {
      if (user && (!currentUser || user.id !== currentUser.id)) {
        currentUser = user;
        if (isFirstLoad) {
          loadInitialData();
          isFirstLoad = false;
        }
      } else if (!user) {
        currentUser = null;
        currentExchange = null;
        isMaker = false;
        isTaker = false;
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  });

  async function checkUserStatus() {
    if (!currentUser) return;
    
    isLoading = true;
    try {
      const response = await fetch(`${API_BASE_URL}/exchanges/current`, {
        credentials: "include",
        headers: {'Accept': 'application/json'}
      });
      
      if (response.ok) {
        const data = await response.json();
        currentExchange = data;
        isMaker = data.maker?.user.username === currentUser?.username;
        isTaker = data.taker?.user.username === currentUser?.username;
        
        // If there's an active exchange, switch to the active tab
        if (currentExchange) {
          activeTab = 'active';
        }
      } else {
        currentExchange = null;
        isMaker = false;
        isTaker = false;
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      isLoading = false;
    }
  }

  async function fetchExchangeMakers() {
    if (isMaker) return;
    
    isLoading = true;
    try {
      const response = await fetch(`${API_BASE_URL}/exchanges/makers`, {
        credentials: "include",
        headers: {'Accept': 'application/json'}
      });
      if (response.ok) {
        const data = await response.json();
        exchangeMakers = data.makers || [];
        exchangeMakers.sort((a, b) => 
          Math.max(b.taker_genre_matches?.length || 0, b.maker_genre_matches?.length || 0) - 
          Math.max(a.taker_genre_matches?.length || 0, a.maker_genre_matches?.length || 0)
        );
      } else {
        console.error('Ошибка при загрузке предложений на обмен');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      isLoading = false;
    }
  }

  async function becomeMaker() {
    if (isMaker) return; 
    
    isLoading = true;
    try {
      const response = await fetch(`${API_BASE_URL}/exchanges/makers`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: "include"
      });
      if (response.ok) {
        isMaker = true;
        await checkUserStatus();
        exchangeMakers = [];
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      isLoading = false;
    }
  }

  async function cancelExchange() {
    if (!isMaker && !isTaker) return;
    
    isLoading = true;
    try {
      const response = await fetch(`${API_BASE_URL}/exchanges`, {
        method: 'DELETE',
        credentials: "include"
      });

      if (response.status === 204) {
        isMaker = false;
        isTaker = false;
        currentExchange = null;
        if (activeTab === 'offers') {
          await fetchExchangeMakers();
        }
      } else {
        console.error('Ошибка при отмене обмена');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      isLoading = false;
    }
  }

  async function becomeTaker() {
    if (!selectedMakerId || isTaker) return;
    
    isLoading = true;
    try {
      const response = await fetch(`${API_BASE_URL}/exchanges/takers`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: "include",
        body: JSON.stringify({ maker_id: selectedMakerId }),
      });

      if (response.ok) {
        isTaker = true;
        await checkUserStatus();
        selectedMakerId = null;
        activeTab = 'active';
      } else {
        console.error('Ошибка при попытке стать тейкером');
        const errorData = await response.json();
        console.error('Детали ошибки:', errorData);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      isLoading = false;
    }
  }

  function selectMaker(makerId: string) {
    selectedMakerId = makerId;
  }

  async function acceptExchange() {
      isLoading = true;
      try {
          const response = await fetch(`${API_BASE_URL}/exchanges/makers/accept`, {
              method: 'PUT',
              headers: {'Content-Type': 'application/json'},
              credentials: "include",
              body: JSON.stringify({ userId: currentUser.id }),
          });
          if (response.ok) {
              await checkUserStatus();
          } else {
              console.error('Ошибка при подтверждении обмена');
          }
      } catch (error) {
          console.error('Ошибка сети:', error);
      } finally {
          isLoading = false;
      }
  }

  function handleTabChange(tab: string) {
      if (activeTab === tab) return; 
      
      activeTab = tab;
      isLoading = true;
      
      if (tab === 'offers' && !isInitialLoad) {
          fetchExchangeMakers().finally(() => isLoading = false);
      } else {
          isLoading = false;
      }
      
      isInitialLoad = false;
  }
</script>

<main class="container">
  <nav class="menu">
      <a href="/" class="menu-item">Главная</a>
      <a href="/exchange" class="menu-item">Начать обмен</a>
      <a href="/my-exchanges" class="menu-item">Мои обмены</a>
  </nav>

  <div class="layout">
      <aside class="sidebar">
          {#if currentUser}
              <div class="user-info">
                  <p class="username">{currentUser.username}</p>
                  <p class="name">{currentUser.firstName} {currentUser.lastName}</p>
                  <p class="rating">Рейтинг: {currentUser.rating}</p>
              </div>
          {:else}
              <div class="user-info">
                  <p class="username">Гость</p>
                  <p class="rating">Рейтинг: -</p>
              </div>
          {/if}

          <button class="sidebar-item {activeTab === 'offers' ? 'active' : ''}" on:click={() => handleTabChange('offers')}>Предложения на обмен</button>
          <button class="sidebar-item {activeTab === 'active' ? 'active' : ''}" on:click={() => handleTabChange('active')}>Активные обмены</button>
      </aside>

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
                    <button on:click={cancelExchange} class="action-button cancel">Остановить поиск</button>
                {:else if isTaker}
                    <p class="status-message">Вы выбрали партнера для обмена. Ожидайте подтверждения.</p>
                {/if}
                
                {#if isMaker}
                <p class="status-message">Вы стали мейкером, ожидайте предложение на обмен.</p>
            {:else if !isTaker}
                <h3>Доступные варианты для обмена</h3>
                <div class="exchange-list compact">
                    {#each exchangeMakers as maker (maker.id)}
                        {#if maker.id !== currentUser?.id}
                            <div class="exchange-item compact {selectedMakerId === maker.id ? 'selected' : ''}"
                                 on:click={() => selectMaker(maker.id)}>
                                <div class="exchange-summary">
                                    <div class="user-info-compact">
                                        <span class="user-name">{maker.user.first_name} {maker.user.last_name}</span>
                                        <span class="user-rating">★ {maker.user.rating}</span>
                                    </div>
                                    <div class="book-info-compact">
                                        <span class="book-title">{maker.book.name}</span>
                                        <span class="book-author">{maker.book.author.first_name} {maker.book.author.last_name}</span>
                                    </div>
                                    <div class="genre-matches">
                                        <span class="matches-count">
                                            Совпадений: {Math.max(maker.taker_genre_matches?.length || 0, maker.maker_genre_matches?.length || 0)}
                                        </span>
                                    </div>
                                </div>
                                  <button 
                                    on:click|preventDefault={() => becomeTaker()} 
                                    class="accept-button"
                                    title="Выбрать для обмена">
                                    ✓
                                  </button>
                            </div>
                        {/if}
                    {:else}
                        <p>Нет доступных предложений для обмена.</p>
                    {/each}
                </div>
            {/if}
        </div>
              {:else}
              <div class="active-exchanges">
                <h2>Активные обмены</h2>
                {#if currentExchange}
                  <div class="exchange-details">
                    <div class="exchange-books">
                      <!-- User's book (either maker or taker) -->
                      <div class="book-card {isMaker ? 'my-book' : 'their-book'}">
                        <h3>{isMaker ? 'Ваша книга' : 'Книга для обмена'}</h3>
                        <div class="book-info">
                          <p class="book-title">{currentExchange.maker.book.name}</p>
                          <p class="book-author">{currentExchange.maker.book.author.first_name} {currentExchange.maker.book.author.last_name}</p>
                        </div>
                        <div class="user-info">
                          <p class="user-name">{currentExchange.maker.user.first_name} {currentExchange.maker.user.last_name}</p>
                          <p class="user-rating">★ {currentExchange.maker.user.rating}</p>
                        </div>
                      </div>
                      
                      <!-- Partner's book -->
                      {#if currentExchange.taker}
                        <div class="book-card {isTaker ? 'my-book' : 'their-book'}">
                          <h3>{isTaker ? 'Ваша книга' : 'Книга партнера'}</h3>
                          <div class="book-info">
                            <p class="book-title">{currentExchange.taker.book.name}</p>
                            <p class="book-author">{currentExchange.taker.book.author.first_name} {currentExchange.taker.book.author.last_name}</p>
                          </div>
                          <div class="user-info">
                            <p class="user-name">{currentExchange.taker.user.first_name} {currentExchange.taker.user.last_name}</p>
                            <p class="user-rating">★ {currentExchange.taker.user.rating}</p>
                          </div>
                        </div>
                      {:else}
                        <div class="waiting-partner">
                          <p>Ожидание выбора книги партнером...</p>
                        </div>
                      {/if}
                    </div>
                    
                    <div class="exchange-actions">
                      {#if isMaker && !currentExchange.accepted}
                        <button on:click={acceptExchange} class="action-button">
                          Подтвердить обмен
                        </button>
                      {/if}
                      <button on:click={cancelExchange} class="action-button cancel">
                        Отменить обмен
                      </button>
                    </div>
                  </div>
                {:else}
                  <p>Нет активных обменов</p>
                  {#if isMaker || isTaker}
                    <button on:click={cancelExchange} class="action-button cancel">
                      Отменить поиск
                    </button>
                  {/if}
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

  .username, .name {
      font-size: 16px;
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

  .exchange-list {
      margin-top: 20px;
      display: grid;
      gap: 10px;
  }

  .exchange-list.compact {
      gap: 8px;
  }

  .exchange-item {
      background: rgb(50, 53, 55);
      padding: 20px;
      border-radius: 8px;
      display: grid;
      gap: 10px;
  }

  .exchange-item.compact {
      padding: 12px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
  }

  .exchange-summary {
      display: flex;
      gap: 20px;
      align-items: center;
  }

  .user-info-compact {
      display: flex;
      flex-direction: column;
      min-width: 150px;
  }

  .user-name {
      font-weight: bold;
  }

  .user-rating {
      font-size: 0.9em;
      color: rgba(173, 166, 156, 0.8);
  }

  .book-info-compact {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      min-width: 200px;
  }

  .book-title {
      font-weight: bold;
  }

  .book-author {
      font-size: 0.9em;
      color: rgba(173, 166, 156, 0.8);
  }

  .genre-matches {
      min-width: 120px;
      text-align: right;
  }

  .matches-count {
      font-size: 0.9em;
      color: rgba(173, 166, 156, 0.8);
  }

  .accept-button {
      background: rgb(60, 100, 60);
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      color: white;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 10px;
  }

  .accept-button:hover {
      background: rgb(70, 110, 70);
  }

  .action-button {
      padding: 10px 15px;
      background: rgb(60, 63, 65);
      border: none;
      border-radius: 8px;
      color: rgba(173, 166, 156, 1);
      cursor: pointer;
      margin-top: 10px;
      width: fit-content;
  }

  .action-button:hover {
      background: rgb(70, 73, 75);
  }

  .action-button.cancel {
      background: rgb(100, 60, 60);
  }

  .action-button.cancel:hover {
      background: rgb(110, 70, 70);
  }

  .status-message {
      color: rgba(173, 166, 156, 1);
      font-style: italic;
      margin-bottom: 15px;
  }

  /* New styles for active exchange view */
  .exchange-details {
      display: flex;
      flex-direction: column;
      gap: 20px;
  }

  .exchange-books {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
  }

  .book-card {
      background: rgb(50, 53, 55);
      padding: 20px;
      border-radius: 8px;
  }

  .book-card.my-book {
      border-left: 4px solid rgb(60, 100, 60);
  }

  .book-card.their-book {
      border-left: 4px solid rgb(100, 60, 100);
  }

  .book-info {
      margin-bottom: 15px;
  }

  .book-title {
      font-weight: bold;
      font-size: 1.1em;
      margin-bottom: 5px;
  }

  .book-author {
      color: rgba(173, 166, 156, 0.8);
  }

  .user-info {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(173, 166, 156, 0.2);
  }

  .user-name {
      font-weight: bold;
  }

  .user-rating {
      color: rgba(173, 166, 156, 0.8);
  }

  .waiting-partner {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgb(50, 53, 55);
      padding: 20px;
      border-radius: 8px;
      color: rgba(173, 166, 156, 0.8);
  }

  .exchange-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
  }
</style>