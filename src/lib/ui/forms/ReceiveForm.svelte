<script lang="ts">
  import WantToExchangeForm from "./WantToExchangeForm.svelte";
  import ExchangeForm from "./ExchangeForm.svelte";
  import { writable } from "svelte/store";
  
  let currentForm = writable("exchange"); // Начальная форма - exchange
  export let close: () => void;
  export let bookData: { [key: string]: string } | null = null;

  // Загружаем жанры через API
  let genres: string[] = [];
  let selectedGenres: string[] = [];
  

  async function fetchGenres() {
    try {
      const res = await fetch("v1/genres");
      const data = await res.json();
      genres = data;
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Неизвестная ошибка");
    }
  }

  fetchGenres();

  // Функция отправки жанров
  const submitGenres = async () => {
    try {
      const response = await fetch("v1/wish-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genres: selectedGenres }),
      });

      if (!response.ok) throw new Error("Не удалось сохранить жанры");
      alert("Жанры успешно сохранены");
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Ошибка при сохранении жанров");
    }
  };

  // Функция для получения данных книги при возврате назад на форму "Хочу обменять"
  const fetchBookData = async () => {
    try {
      const res = await fetch("v1/books");
      const data = await res.json();
      bookData = data; // Заполняем bookData данными книги
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Ошибка при получении данных книги");
    }
  };

  const openWantToExchangeForm = () => {
    currentForm.set("wantToExchange");
    console.log('openWantToExchangeForm:', $currentForm);
  };

  const openExchangeForm = () => {
    currentForm.set("exchange");
    console.log('openExchangeForm:', $currentForm);
  };
  
  const openReceiveForm = () => {
    currentForm.set("receive");
    console.log('openReceiveForm:', $currentForm);
  };
</script>

<div class="form-container">
  <div class="button-group">
    <button class="start-exchange-btn" on:click={openWantToExchangeForm}>Хочу обменять</button>
    <button class="start-exchange-btn" on:click={openExchangeForm}>Адрес</button>
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
</div>

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
  .form-container {
    background: rgb(42, 45, 47);
    color: rgba(173, 166, 156, 1);
    padding: 20px;
    border-radius: 10px;
    max-width: 700px;
    width: 100%;
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    gap: 15px;
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
    background: rgb(42, 45, 47);
    color: rgba(173, 166, 156, 1);
    border: 1px solid rgba(173, 166, 156, 0.5);
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .start-exchange-btn:hover {
    background: rgb(50, 53, 55);
    border-color: rgba(173, 166, 156, 1);
  }

  .close-btn {
    align-self: flex-end;
    background: none;
    border: none;
    font-size: 20px;
    color: rgba(173, 166, 156, 1);
    cursor: pointer;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: rgb(255, 0, 0);
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
    background: rgb(50, 53, 55);
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
    accent-color: rgba(173, 166, 156, 1);
  }

  .submit-btn, .back-btn {
    padding: 10px;
    background: rgb(42, 45, 47);
    color: rgba(173, 166, 156, 1);
    border: 1px solid rgba(173, 166, 156, 0.5);
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    margin-top: 10px;
  }

  .submit-btn:hover, .back-btn:hover {
    background: rgb(50, 53, 55);
    border-color: rgba(173, 166, 156, 1);
  }
</style>
