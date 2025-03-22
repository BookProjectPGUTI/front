<script lang="ts">
  export let close: () => void; // Функция для закрытия формы
  export let openExchangeForm: () => void; // Функция для открытия формы обмена
  export let openReceiveForm: () => void; // Функция для открытия формы получения
  export let showWantToExchangeForm: boolean = false;  // Значение по умолчанию
  export let bookData: { [key: string]: string } | null = null; // Можно не передавать
  let authorName: string = "";
  let bookTitle: string = "";
  let isbn: string = "";
  let publicationYear: string = "";
  let genres: Genre[] = [];
  let genresLoaded: boolean = false;
  let error: string = "";
  let bookId: string | null = null; // Идентификатор книги

  interface Genre {
    id: number;
    name: string;
    selected: boolean;
  }

  // Функция для загрузки жанров
  const fetchGenres = async (): Promise<void> => {
    try {
      const response = await fetch("/v1/genres");
      if (!response.ok) {
        if (response.status === 404) {
          error = "Не удалось получить список жанров";
        } else {
          throw new Error("Неизвестная ошибка");
        }
        return;
      }
      genres = (await response.json()).map((genre: { id: number; name: string }) => ({
        ...genre,
        selected: false,
      }));
      genresLoaded = true;
    } catch (err) {
      error = (err as Error).message;
    }
  };

  // Функция для сохранения книги (обновление или создание новой)
  const saveBook = async (): Promise<void> => {
    // Проверяем, что все обязательные поля заполнены
    if (!authorName || !bookTitle || !isbn || !publicationYear) {
      alert("Пожалуйста, заполните все поля.");
      return;
    }

    const selectedGenres = genres.filter((genre) => genre.selected).map((genre) => genre.id);

    const bookData = {
      authorName,
      bookTitle,
      isbn,
      publicationYear,
      genres: selectedGenres,
    };

    try {
      let response;
      if (bookId) {
        // Если книга уже существует, обновляем её
        response = await fetch(`/v1/books/${bookId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookData),
        });
      } else {
        // Если книга новая, отправляем POST запрос
        response = await fetch("/v1/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookData),
        });
      }

      if (!response.ok) {
        if (response.status === 400) {
          const data = await response.json();
          if (data.detail === "Имя автора превышает разрешенное количество символов") {
            error = "Имя автора превышает разрешенное количество символов";
          } else if (data.detail === "Ни один из жанров не был выбран") {
            error = "Ни один из жанров не был выбран";
          } else {
            throw new Error("Ошибка при сохранении книги");
          }
        } else if (response.status === 401) {
          const data = await response.json();
          error = data.detail === "Пользователь не авторизован" ? "Пользователь не авторизован" : "Неизвестная ошибка";
        } else if (response.status === 409) {
          const data = await response.json();
          error = data.detail === "Такой номер ISBN уже зарегестрирован" ? "Такой номер ISBN уже зарегистрирован" : "Неизвестная ошибка";
        } else {
          throw new Error("Неизвестная ошибка");
        }
        return;
      }

      const data = await response.json();
      bookId = data.id; // Сохраняем идентификатор книги для дальнейшего редактирования

      alert("Книга успешно сохранена!");

      // Переходим на следующую форму "Хочу получить"
      openReceiveForm(); // Открываем форму "Хочу получить"
    } catch (err) {
      error = (err as Error).message;
    }
  };

  // Функция для получения данных книги при возврате
  const fetchBookData = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/v1/books/${id}`);
      if (!response.ok) throw new Error("Не удалось получить данные книги");

      const data = await response.json();
      authorName = data.authorName;
      bookTitle = data.bookTitle;
      isbn = data.isbn;
      publicationYear = data.publicationYear;
      genres.forEach((genre) => {
        genre.selected = data.genres.includes(genre.id); // Помечаем жанры, которые были выбраны
      });

      bookId = data.id; // Сохраняем идентификатор книги
    } catch (err) {
      error = (err as Error).message;
    }
  };

  // Если bookId задан, получаем данные книги
  if (bookId) {
    fetchBookData(bookId);
  }
</script>

<div class="form-container">
  <div class="button-group">
    <button class="start-exchange-btn" on:click={openExchangeForm}>Адрес доставки</button>
    <button class="start-exchange-btn" on:click={openReceiveForm}>Хочу получить</button>
  </div>

  <h2>Хочу обменять книгу</h2>

  

  <div class="form-content">
    <div class="left-column">
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
    </div>

    <div class="right-column">
      <div class="form-group">
        <h3>Категории</h3>
        <button class="fetch-genres-btn" on:click={fetchGenres}>Показать жанры</button>

        {#if error}
          <p class="error">{error}</p>
        {:else if genresLoaded}
          <div class="categories-container">
            {#each genres as genre (genre.id)}
              <label>
                <input type="checkbox" bind:checked={genre.selected} /> {genre.name}
              </label>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Кнопка "Далее" для отправки данных -->
  <button class="save-btn" on:click={saveBook}>Далее</button>
</div>

<style>
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
    justify-content: space-between;
    gap: 20px;
  }

  .left-column,
  .right-column {
    flex: 1;
  }

  .form-group {
    margin-bottom: 10px;
  }

  .form-group label {
    font-weight: bold;
  }

  .form-group input {
    width: 100%;
    padding: 8px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background: #f9f9f9;
    color: #003366;
  }

  .right-column .form-group {
    margin-top: 30px;
  }

  .fetch-genres-btn {
    width: 100%;
    padding: 10px;
    background: #007bff;
    color: #ffffff;
    border: 1px solid #0056b3;
    border-radius: 5px;
    cursor: pointer;
  }

  .fetch-genres-btn:hover {
    background: #0056b3;
    border-color: #004494;
  }

  .categories-container label {
    display: block;
    margin: 5px 0;
  }

  .error {
    color: red;
    font-size: 14px;
    margin-top: 10px;
  }

  .save-btn {
    padding: 10px;
    background: #007bff;
    color: #ffffff;
    border: 1px solid #0056b3;
    border-radius: 5px;
    cursor: pointer;
  }

  .save-btn:hover {
    background: #0056b3;
    border-color: #004494;
  }
</style>
