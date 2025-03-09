<script lang="ts">
  import type { Writable } from "svelte/store";

  export let showWantToExchangeForm: Writable<boolean>;
  export let close: () => void;
  export let openExchangeForm: () => void;
  export let openReceiveForm: () => void;
  let authorName = "";
  let bookTitle = "";
  let isbn = "";
  let publicationYear = "";
  
  type Genre = {
    name: string;
    expanded: boolean;
    options: string[];
  };

  let genres: Genre[] = [
    { name: "Жанр", expanded: false, options: ["Фэнтези", "Детектив", "Роман"] },
    { name: "Область наук", expanded: false, options: ["Математика", "Физика", "Биология"] },
    { name: "Состояние", expanded: false, options: ["Новое", "Б/У", "Коллекционное"] },
    { name: "Обложка", expanded: false, options: ["Мягкая", "Твердая"] },
    { name: "Лауреат", expanded: false, options: ["Букер", "Нобелевская премия"] },
    { name: "Экранизация", expanded: false, options: ["Да", "Нет"] },
    { name: "Язык издания", expanded: false, options: ["Русский", "Английский"] },
  ];

  const toggleExpand = (genre: Genre) => {
    genre.expanded = !genre.expanded;
  };
</script>

<div class="form-container">
  <h2>Хочу обменять книгу</h2>

  <button class="close-btn" on:click={close}>&times;</button>
  <div class="form-group">
    <label for="authorName">Автор</label>
    <input type="text" id="authorName" bind:value={authorName} placeholder="Имя автора" />
  </div>

  <div class="form-group">
    <label for="bookTitle">Название книги</label>
    <input type="text" id="bookTitle" bind:value={bookTitle} placeholder="Название книги" />
  </div>

  <div class="form-group">
    <label for="isbn">ISBN</label>
    <input type="text" id="isbn" bind:value={isbn} placeholder="ISBN" />
  </div>

  <div class="form-group">
    <label for="publicationYear">Год издания</label>
    <input type="text" id="publicationYear" bind:value={publicationYear} placeholder="Год издания" />
  </div>

  <div class="form-group">
    <h3>Категории</h3>
    <div class="categories-container">
      {#each genres as genre (genre.name)}
        <div class="category">
          <button class="category-btn" on:click={() => toggleExpand(genre)}>
            {genre.expanded ? "-" : "+"} {genre.name}
          </button>
          {#if genre.expanded}
            <div class="category-options">
              {#each genre.options as option (option)}
                <label>
                  <input type="checkbox" /> {option}
                </label>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <button 
    class="start-exchange-btn" 
    on:click={openExchangeForm} 
    aria-label="Открыть форму для ввода адреса доставки">
    Адрес доставки
  </button>
  <button 
  class="start-exchange-btn" 
  on:click={openReceiveForm} 
  aria-label="Открыть форму для получения книги">
  Хочу получить
</button>

</div>

<style>
  .form-container {
    background: rgb(42, 45, 47);
    color: rgba(173, 166, 156, 1);
    padding: 20px;
    border-radius: 10px;
    width: 500px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    gap: 15px;
    z-index: 10;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .form-group input {
    padding: 8px;
    border-radius: 5px;
    border: 1px solid rgba(173, 166, 156, 1); /* Цвет границы */
    color: rgba(173, 166, 156, 1); /* Цвет текста */
    background-color: transparent;
  }

  .form-group input::placeholder {
    color: rgba(173, 166, 156, 0.5); /* Цвет текста в placeholder */
  }

  .categories-container {
    background: black;
    color: rgba(173, 166, 156, 1);
    padding: 10px;
    border-radius: 5px;
    max-width: 300px;
  }

  .category {
    margin-bottom: 5px;
  }

  .category-btn {
    background: none;
    color: rgba(173, 166, 156, 1);
    border: none;
    cursor: pointer;
    display: block;
    text-align: left;
  }

  .category-options {
    margin-left: 10px;
    padding: 5px;
  }

  .category-options label {
    display: block;
  }

  .start-exchange-btn {
    margin-top: 15px;
    padding: 10px;
    background: rgb(42, 45, 47);
    color: rgba(173, 166, 156, 1);
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .start-exchange-btn:hover {
    background: rgb(50, 53, 55);
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }
</style>
