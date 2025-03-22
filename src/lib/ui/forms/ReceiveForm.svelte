<script lang="ts">
  import WantToExchangeForm from "./WantToExchangeForm.svelte";
  import ExchangeForm from "./ExchangeForm.svelte";
  import { writable } from "svelte/store";

  let currentForm = writable("receive"); 
  export let close: () => void;
  export let bookData: { [key: string]: string } | null = null;
  export let selectedGenres: string[] = [];
  export let updateGenres: (newGenres: string[]) => void;

  // Загружаем жанры через API
  let genres: string[] = [];

  async function fetchGenres() {
    try {
      const res = await fetch("v1/genres");
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Не удалось получить список жанров");
        }
        throw new Error("Ошибка при загрузке жанров");
      }
      genres = await res.json();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Неизвестная ошибка");
    }
  }

  fetchGenres();

  // Функция отправки жанров
  const submitGenres = async () => {
    try {
      if (selectedGenres.length === 0) {
        throw new Error("Ни один из жанров не был выбран");
      }
      
      const response = await fetch("v1/wish-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genres: selectedGenres }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Ни один из жанров не был выбран");
        } else if (response.status === 401) {
          throw new Error("Пользователь не авторизован");
        }
        throw new Error("Не удалось сохранить жанры");
      }

      alert("Жанры успешно сохранены");
      openExchangeForm();  // Переход к форме обмена после успешного сохранения
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Ошибка при сохранении жанров");
    }
  };

  // Функция для получения данных книги при возврате назад на форму "Хочу обменять"
  const fetchBookData = async () => {
    try {
      const res = await fetch("v1/books");
      if (!res.ok) {
        throw new Error("Ошибка при получении данных книги");
      }
      bookData = await res.json();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Ошибка при получении данных книги");
    }
  };

  const openWantToExchangeForm = () => {
    currentForm.set("wantToExchange");
    console.log('openWantToExchangeForm:', $currentForm);
  };

  const openExchangeForm = () => {
    currentForm.set("exchange");  // Устанавливаем форму "Адрес"
    console.log('openExchangeForm:', $currentForm);
  };
  
  const openReceiveForm = () => {
    currentForm.set("receive");
    console.log('openReceiveForm:', $currentForm);
  };

  // Функция для возврата на форму "Хочу обменять"
  const goBackToWantToExchangeForm = async () => {
    await fetchBookData();  // Получаем данные книги
    openWantToExchangeForm(); // Переход к форме "Хочу обменять"
  };
</script>

{#if $currentForm === "receive"}
<div class="form-container">
  <div class="button-group">
    <button class="start-exchange-btn" on:click={openWantToExchangeForm}>Хочу обменять</button>
    <button class="start-exchange-btn" on:click={openExchangeForm}>Адрес доставки</button>
  </div>

  <h2>Выберите жанры</h2>
  <div class="form-content">
    <div class="genre-list">
      {#each genres as genre}
        <label>
          <input type="checkbox" bind:group={selectedGenres} value={genre} />
          {genre}
        </label>
      {/each}
    </div>
  </div>

  <button class="submit-btn" on:click={submitGenres}>Далее</button>

  <!-- Кнопка назад -->
  <button class="back-btn" on:click={goBackToWantToExchangeForm}>Назад</button>
</div>
{/if}

{#if $currentForm === "wantToExchange"}
  <WantToExchangeForm close={close}
  openExchangeForm={openExchangeForm}
  openReceiveForm={openReceiveForm}
  showWantToExchangeForm={true}  
  bookData={bookData}/>
{/if}

{#if $currentForm === "exchange"}
  <ExchangeForm close={close} />
{/if}

<style>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: #e0f7ff;
    color: #333;
  }

  .menu {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .menu-item {
    padding: 10px 15px;
    background: #007bff;
    border-radius: 8px;
    text-decoration: none;
    color: #fff;
    border: 1px solid #0056b3;
    cursor: pointer;
    transition: background 0.3s, color 0.3s;
  }

  .menu-item:hover {
    background: #0056b3;
  }

  .content {
    background: #ffffff;
    color: #333;
    padding: 20px;
    border-radius: 10px;
    max-width: 800px;
    width: 100%;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

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

  .form-container {
    width: 100%;
    max-width: 700px;
    margin: 20px auto;
    background: #ffffff;
    color: #333;
    padding: 20px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .button-group {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 15px;
  }

  .start-exchange-btn {
    flex: 1;
    padding: 10px;
    background: #007bff;
    color: #ffffff;
    border: 1px solid #0056b3;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .start-exchange-btn:hover {
    background: #0056b3;
    border-color: #004494;
  }

  .close-btn {
    align-self: flex-end;
    background: none;
    border: none;
    font-size: 20px;
    color: #003366;
    cursor: pointer;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: #ff0000;
  }

  .form-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .genre-list {
    display: flex;
    flex-direction: column;
    max-height: 200px;
    overflow-y: auto;
    background: #f9f9f9;
    padding: 10px;
    border-radius: 5px;
  }

  .genre-list label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
  }

  .genre-list input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #007bff;
  }

  .submit-btn, .back-btn {
    padding: 10px;
    background: #007bff;
    color: #ffffff;
    border: 1px solid #0056b3;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    margin-top: 10px;
  }

  .submit-btn:hover, .back-btn:hover {
    background: #0056b3;
    border-color: #004494;
  }
</style>

