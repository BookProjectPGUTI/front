<script lang="ts">
  import { userStore, API_BASE_URL } from '$lib/stores';
  import { onMount } from 'svelte';
  import '@fortawesome/fontawesome-free/css/all.css';

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

  let trackNumber = '';
  let trackNumberError = '';
  let shakingMakerId: string | null = null;


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
      
      exchangeMakers.sort((a, b) => {
        const aTakerMatches = a.taker_genre_matches?.length || 0;
        const bTakerMatches = b.taker_genre_matches?.length || 0;
        
        const aMakerMatches = a.maker_genre_matches?.length || 0;
        const bMakerMatches = b.maker_genre_matches?.length || 0;
        
        const aTotalMatches = aTakerMatches + aMakerMatches;
        const bTotalMatches = bTakerMatches + bMakerMatches;
        
        if (bTotalMatches !== aTotalMatches) {
          return bTotalMatches - aTotalMatches;
        }
        
        return b.user.rating - a.user.rating;
      });
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
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_role: isMaker ? 'maker' : 'taker'
        })
      });

      if (response.status === 204) {
        isMaker = false;
        isTaker = false;
        currentExchange = null;
        if (activeTab === 'offers') {
          await fetchExchangeMakers();
        }
      } else {
        const errorData = await response.json();
        console.error('Ошибка при отмене обмена:', errorData);
        alert(`Ошибка при отмене обмена: ${errorData.detail || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      alert('Ошибка сети при попытке отменить обмен');
    } finally {
      isLoading = false;
    }
  }

  async function becomeTaker(makerId: string) {
    if (isTaker) return;

    shakingMakerId = makerId;
    
    isLoading = true;
    try {
      const response = await fetch(`${API_BASE_URL}/exchanges/takers`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: "include",
        body: JSON.stringify({ maker_id: makerId }),
      });

      if (response.ok) {
        isTaker = true;
        selectedMakerId = makerId;
        await checkUserStatus();
        activeTab = 'active';
      } else {
        console.error('Ошибка при попытке стать тейкером');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      shakingMakerId = null;
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
        body: JSON.stringify({ is_accepted: true })
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

  async function submitTrackNumber(role: 'maker' | 'taker') {
    if (trackNumber.length !== 14) {
      trackNumberError = 'Трек-номер должен содержать ровно 14 символов';
      return;
    }

    trackNumberError = '';
    isLoading = true;

    try {
      const response = await fetch(`${API_BASE_URL}/exchanges/track-number`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({
          track_number: trackNumber,
          user_role: role
        })
      });

      if (response.ok) {
        trackNumber = '';
        await checkUserStatus();
      } else {
        const errorData = await response.json();
        trackNumberError = errorData.detail || 'Ошибка при отправке трек-номера';
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      trackNumberError = 'Ошибка сети при отправке трек-номера';
    } finally {
      isLoading = false;
    }
  }

  async function confirmReceived(role: 'maker' | 'taker') {
    isLoading = true;
    try {
      const response = await fetch(`${API_BASE_URL}/exchanges/received`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({
          user_role: role
        })
      });

      if (response.ok) {
        await checkUserStatus();
      } else {
        const errorData = await response.json();
        console.error('Ошибка при подтверждении получения:', errorData);
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
              <div class="exchange-notification">
                <p class="status-message">
                  Вы выбрали партнера для обмена. Ожидайте подтверждения или отмените обмен.
                  <!-- svelte-ignore a11y_invalid_attribute -->
                  <a href="#" on:click|preventDefault={() => activeTab = 'active'} class="view-link">Смотреть</a>
                </p>
              </div>
            {/if}

            {#if isMaker}
              {#if currentExchange}
                <div class="exchange-notification">
                  <p class="status-message">
                    Вам предложили обмен.
                    <!-- svelte-ignore a11y_invalid_attribute -->
                    <a href="#" on:click|preventDefault={() => activeTab = 'active'} class="view-link">Смотреть</a>
                  </p>
                </div>
              {:else}
                <p class="status-message">Вы стали мейкером, ожидайте предложение на обмен.</p>
              {/if}
            {:else if !isTaker}
              <h3>Доступные варианты для обмена</h3>
              <div class="exchange-list compact">
                {#each exchangeMakers as maker (maker.id)}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  {#if maker.id !== currentUser?.id}
                  <div class="exchange-item compact {selectedMakerId === maker.id ? 'selected' : ''}"
                  on:click={() => selectMaker(maker.id)}>
                    <div class="user-info-compact">
                      <span class="user-name">{maker.user.first_name} {maker.user.last_name}</span>
                      <span class="user-rating">★ {maker.user.rating}</span>
                    </div>
                  
                    <div class="book-info-line">
                      <span class="book-title">{maker.book.name}</span>
                      <span class="book-author">{maker.book.author.first_name} {maker.book.author.last_name}</span>
                      
                      <div class="book-meta">
                        {#if maker.book.publication_year}
                          <span class="meta-item"><i class="fas fa-calendar-alt"></i> {maker.book.publication_year}</span>
                        {/if}
                        {#if maker.book.isbn}
                          <span class="meta-item"><i class="fas fa-barcode"></i> {maker.book.isbn}</span>
                        {/if}
                      </div>
                      
                      <div class="genres-container">
                        {#each maker.book.genres as genre}
                          {#if maker.taker_genre_matches.some((takerGenre: { id: any; }) => takerGenre.id === genre.id)}
                            <span class="genre matched">{genre.name}</span>
                          {:else}
                            <span class="genre">{genre.name}</span>
                          {/if}
                        {/each}
                      </div>
                    </div>
                  
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button
                      on:click|preventDefault={() => becomeTaker(maker.id)}
                      class="accept-button {shakingMakerId === maker.id ? 'shaking' : ''}"
                      title="Выбрать для обмена">
                      <i class="fas fa-handshake"></i>
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
                <!-- Maker's book -->
                <div class="book-card {isMaker ? 'my-book' : 'their-book'} {currentExchange.maker.is_accepted ? 'accepted' : ''}">
                  <h3>{isMaker ? 'Ваша книга' : 'Книга для обмена'}</h3>
                  <div class="book-info">
                    <p class="book-title">{currentExchange.maker.book.name}</p>
                    <p class="book-author">{currentExchange.maker.book.author.first_name} {currentExchange.maker.book.author.last_name}</p>
                    
                    <!-- Добавленная информация о книге -->
                    <div class="book-meta">
                      {#if currentExchange.maker.book.publication_year}
                        <span class="meta-item"><i class="fas fa-calendar-alt"></i> {currentExchange.maker.book.publication_year}</span>
                      {/if}
                      {#if currentExchange.maker.book.isbn}
                        <span class="meta-item"><i class="fas fa-barcode"></i> ISBN: {currentExchange.maker.book.isbn}</span>
                      {/if}
                    </div>

                    <!-- Добавленные жанры -->
                    <div class="genres-container">
                      {#each currentExchange.maker.book.genres as genre}
                        <span class="genre">{genre.name}</span>
                      {/each}
                    </div>
                  </div>
                  
                    <div class="user-info">
                      <p class="user-name">{currentExchange.maker.user.first_name} {currentExchange.maker.user.last_name}</p>
                      <p class="user-rating">★ {currentExchange.maker.user.rating}</p>
                    </div>
            
                  {#if currentExchange.maker.is_accepted && isMaker && !currentExchange.maker.track_number}
                    <div class="track-number-input">
                      <label for="track-number-maker">Трек-номер посылки (14 символов)</label>
                      <input
                        id="track-number-maker"
                        type="text"
                        bind:value={trackNumber}
                        maxlength="14"
                        placeholder="Введите трек-номер"
                      />
                      {#if trackNumberError}
                        <p class="error-message">{trackNumberError}</p>
                      {/if}
                      <button on:click={() => submitTrackNumber('maker')} class="action-button">
                        Отправить трек-номер
                      </button>
                    </div>
                  {:else if currentExchange.maker.track_number}
                    <div class="track-number-info">
                      <p>Трек-номер отправлен: {currentExchange.maker.track_number}</p>
                      {#if currentExchange.maker.is_received}
                        <p class="received-info">✅ Получено</p>
                      {/if}
                    </div>
                  {/if}
                </div>
            
                {#if currentExchange.taker}
                <div class="book-card {isTaker ? 'my-book' : 'their-book'} {currentExchange.maker.is_accepted ? 'accepted' : ''}">
                  <h3>{isTaker ? 'Ваша книга' : 'Книга партнера'}</h3>
                  <div class="book-info">
                    <p class="book-title">{currentExchange.taker.book.name}</p>
                    <p class="book-author">{currentExchange.taker.book.author.first_name} {currentExchange.taker.book.author.last_name}</p>
                      
                    <div class="book-meta">
                      {#if currentExchange.taker.book.publication_year}
                        <span class="meta-item"><i class="fas fa-calendar-alt"></i> {currentExchange.taker.book.publication_year}</span>
                      {/if}
                      {#if currentExchange.taker.book.isbn}
                        <span class="meta-item"><i class="fas fa-barcode"></i> ISBN: {currentExchange.taker.book.isbn}</span>
                      {/if}
                    </div>
                      
                    <div class="genres-container">
                      {#each currentExchange.taker.book.genres as genre}
                        <span class="genre">{genre.name}</span>
                      {/each}
                    </div>
                  </div>
                    
                  <div class="user-info">
                    <p class="user-name">{currentExchange.taker.user.first_name} {currentExchange.taker.user.last_name}</p>
                    <p class="user-rating">★ {currentExchange.taker.user.rating}</p>
                  </div>
            
                    {#if currentExchange.maker.is_accepted && isTaker && !currentExchange.taker.track_number}
                      <div class="track-number-input">
                        <label for="track-number-taker">Трек-номер посылки (14 символов)</label>
                        <input
                          id="track-number-taker"
                          type="text"
                          bind:value={trackNumber}
                          maxlength="14"
                          placeholder="Введите трек-номер"
                        />
                        {#if trackNumberError}
                          <p class="error-message">{trackNumberError}</p>
                        {/if}
                        <button on:click={() => submitTrackNumber('taker')} class="action-button">
                          Отправить трек-номер
                        </button>
                      </div>
                    {:else if currentExchange.taker.track_number}
                      <div class="track-number-info">
                        <p>Трек-номер отправлен: {currentExchange.taker.track_number}</p>
                        {#if currentExchange.taker.is_received}
                          <p class="received-info">✅ Получено</p>
                        {/if}
                      </div>
                    {/if}
                  </div>
                {:else}
                  <div class="waiting-partner">
                    <p>Ожидание выбора книги партнером...</p>
                  </div>
                {/if}
              </div>
            
              {#if !currentExchange.maker.is_accepted}
                <div class="exchange-actions">
                  {#if isMaker}
                    <button on:click={acceptExchange} class="action-button">
                      Подтвердить обмен
                    </button>
                  {/if}
                  <button on:click={cancelExchange} class="action-button cancel">
                    Отменить обмен
                  </button>
                </div>
              {/if}
            
              {#if currentExchange.taker?.track_number && currentExchange.maker?.track_number}
                <div class="confirmation-buttons">
                  {#if isMaker && !currentExchange.maker.is_received}
                    <button on:click={() => confirmReceived('maker')} class="action-button received">
                      Подтвердить получение
                    </button>
                  {/if}
                  {#if isTaker && !currentExchange.taker.is_received}
                    <button on:click={() => confirmReceived('taker')} class="action-button received">
                      Подтвердить получение
                    </button>
                  {/if}
                </div>
              {/if}
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
    background:  #fff;
    border-radius: 8px;
    text-decoration: none;
    color: #000000;
    border: 2px solid transparent;
    transition: border-color 0.3s ease, background-color 0.3s ease;
  }
  .menu-item:hover {
      background: #ccc;
      border-color: #ccc;
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
    background: #f9f9f9;
    padding: 20px;
    border-radius: 10px;
  }

  .user-info {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #000000;
  }

  .username, .name {
    font-size: 16px;
    margin: 0;
    color: #000000;
  }

  .rating {
    font-size: 14px;
    margin: 5px 0 0;
    color: #000000;
  }

  .sidebar-item {
    padding: 10px 15px;
    background:  #00aaff;
    border-radius: 8px;
    text-decoration: none;
    color:  #ffffff;
    cursor: pointer;
    text-align: left;
    border: none;
  }

  .sidebar-item.active {
    background: #4da6ff;
  }

  .content {
    flex: 1;
    background:#f9f9f9  ;
    color: rgb(0, 0, 0);
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
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    display: grid;
    gap: 10px;
  }

  .exchange-item.compact {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    width: 100%;
  }

  .user-info-compact {
    display: flex;
    flex-direction: column;
    min-width: 120px;
    flex-shrink: 0;
  }


  .user-name {
    font-weight: 500;
    font-size: 0.9em;
    white-space: nowrap;
  }

  .user-rating {
    font-size: 0.8em;
    color: #666;
  }

  .book-info-line {
    display: flex;
    flex-grow: 1;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .book-title {
    font-weight: bold;
    font-size: 0.9em;
    min-width: 120px;
  }

  .book-author {
    font-size: 0.85em;
    color: #555;
    min-width: 120px;
  }

  .book-meta {
    display: flex;
    gap: 8px;
    font-size: 0.8em;
    color: #666;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 3px;
    white-space: nowrap;
  }

  .genres-container {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .genre {
    font-size: 0.7em;
    padding: 2px 6px;
    background: #e0e0e0;
    border-radius: 8px;
    color: #333;
    white-space: nowrap;
  }

  .genre.matched {
    background: #4CAF50;
    color: white;
  }

  .accept-button {
    background: rgb(60, 100, 60);
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    color: white;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: auto;
  }

  .accept-button:hover {
    background: rgb(70, 110, 70);
    transform: scale(1.1);
  }

  .accept-button.shaking {
    animation: shake 0.5s infinite;
  }

  @keyframes shake {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(10deg); }
    50% { transform: rotate(0deg); }
    75% { transform: rotate(-10deg); }
    100% { transform: rotate(0deg); }
  }

  .action-button {
    padding: 10px 15px;
    background:  #00aaff;
    border: none;
    border-radius: 8px;
    color: #ffffff;
    cursor: pointer;
    margin-top: 10px;
    width: fit-content;
  }

  .action-button:hover {
    background: #4da6ff;
  }

  .action-button.cancel {
    background: rgb(100, 60, 60);
  }

  .action-button.cancel:hover {
    background: rgb(110, 70, 70);
  }

  .action-button.received {
    background: rgb(60, 100, 100);
  }

  .action-button.received:hover {
    background: rgb(70, 110, 110);
  }

  .status-message {
    color: rgb(0, 0, 0);
    font-style: italic;
    margin-bottom: 15px;
  }

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
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    position: relative;
  }

  .book-card.my-book {
    border-left: 4px solid rgb(60, 100, 60);
  }

  .book-card.their-book {
    border-left: 4px solid rgb(100, 60, 100);
  }

  .book-card.accepted {
    border-left: 4px solid rgb(60, 160, 60);
    box-shadow: 0 0 0 2px rgba(60, 160, 60, 0.3);
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
    color: rgba(0, 0, 0, 0.8);
  }

  .user-info {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #f9f9f9;
  }

  .user-name {
    font-weight: bold;
  }

  .user-rating {
    color: rgba(0, 0, 0, 0.8);
  }

  .waiting-partner {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    color: rgba(0, 0, 0, 0.8);
  }

  .exchange-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .confirmation-buttons {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .exchange-notification {
    margin-bottom: 15px;
  }

  .view-link {
    color: #a5b4fc;
    text-decoration: underline;
    cursor: pointer;
    margin-left: 4px;
  }

  .view-link:hover {
    color: #818cf8;
    text-decoration: none;
  }

  .track-number-input {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(173, 166, 156, 0.2);
  }

  .track-number-input label {
    display: block;
    margin-bottom: 5px;
    font-size: 0.9em;
    color: rgba(173, 166, 156, 0.8);
  }

  .track-number-input input {
    width: 100%;
    padding: 8px;
    background: rgb(60, 63, 65);
    border: 1px solid rgba(173, 166, 156, 0.2);
    border-radius: 4px;
    color: rgba(173, 166, 156, 1);
    margin-bottom: 5px;
  }

  .track-number-input button {
    margin-top: 10px;
  }

  .error-message {
    color: #ff6b6b;
    font-size: 0.8em;
    margin-top: 5px;
  }

  .track-number-info {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid rgba(173, 166, 156, 0.2);
    font-size: 0.9em;
    color: rgba(173, 166, 156, 0.8);
  }

  .received-info {
    color: #6bff6b;
    font-size: 0.9em;
    margin-top: 5px;
  }
</style>