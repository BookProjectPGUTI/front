<script lang="ts">
    import { onMount } from "svelte";
    let activeTab = "exchange";
    let genres: { id: number, name: string }[] = [];
    let showGenres = false;
    let selectedGenres = new Set<number>();

    let firstName = "";
    let lastName = "";
    let bookName = "";
    let isbn = "";
    let publicationYear = "";
    let bookId: string | null = null; 
    let isGetSuccessful = false; 
    let originalData: any = null;

    function showTab(tab: string) {
        activeTab = tab;
        if (tab === "exchange") {
            fetchActiveBook();
        }
    }

    async function fetchGenres() {
        if (showGenres) {
            showGenres = false;
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/v1/genres", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) throw new Error("Ошибка загрузки жанров");

            const data = await response.json();
            genres = data.genres || [];
            showGenres = true;
        } catch (error) {
            console.error("Ошибка при загрузке жанров:", error);
        }
    }

    async function fetchActiveBook() {
        try {
            const response = await fetch("http://localhost:8000/api/v1/books", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                isGetSuccessful = false;
                throw new Error("Ошибка загрузки книги");
            }

            const data = await response.json();
            if (data) {
                bookId = data.id;
                firstName = data.author.first_name;
                lastName = data.author.last_name;
                bookName = data.name;
                isbn = data.isbn;
                publicationYear = data.publication_year;
                selectedGenres = new Set(data.genres.map((g: { id: number }) => g.id));
                originalData = { ...data }; 
                isGetSuccessful = true;
            }
        } catch (error) {
            console.error("Ошибка при получении активной книги:", error);
            bookId = null;  
            isGetSuccessful = false;
        }
    }

    function toggleGenre(genreId: number) {
        if (selectedGenres.has(genreId)) {
            selectedGenres.delete(genreId);
        } else {
            selectedGenres.add(genreId);
        }
    }

    async function submitForm() {
        const requestBody = {
            author: {
                first_name: firstName,
                last_name: lastName
            },
            name: bookName,
            isbn: isbn,
            publication_year: publicationYear,
            genres_ids: Array.from(selectedGenres)
        };

        try {
            let response;
            if (isGetSuccessful) {
                response = await fetch(`http://localhost:8000/api/v1/books`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                    credentials: "include",
                });
            } else {
                response = await fetch("http://localhost:8000/api/v1/books", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                    credentials: "include",
                });
            }

            if (response.status === 204) {
            console.log("Книга успешно изменена.");
            activeTab = "receive";
        } if (response.status === 201) {
            console.log("Книга успешно создана.");
            activeTab = "receive";
        } 

    } catch (error) {
        console.error("Ошибка при отправке данных:", error);
        alert("Ошибка при отправке данных");
    }
}
    onMount(fetchActiveBook);
</script>



<main class="container">
    <nav class="menu">
        <a href="/" class="menu-item">Главная</a>
        <!-- svelte-ignore a11y_invalid_attribute -->
        <a href="#" class="menu-item active">Начать обмен</a>
        <a href="/my-exchanges" class="menu-item">Мои обмены</a>
    </nav>

    <section class="exchange-form">
        <h2 class="form-title">Бланк обмена</h2>
        <div class="tabs">
            <button on:click={() => showTab('exchange') } class="tab-button {activeTab === 'exchange' ? 'active-tab' : ''}">Хочу обменять</button>
            <button on:click={() => showTab('receive') } class="tab-button {activeTab === 'receive' ? 'active-tab' : ''}">Хочу получить</button>
            <button on:click={() => showTab('address') } class="tab-button {activeTab === 'address' ? 'active-tab' : ''}">Адрес доставки</button>
        </div>

        {#if activeTab === 'exchange'}
        <div class="exchange-container">
            <div class="left-column">
                <div class="form-group">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Автор *</label>
                    <div class="input-group">
                        <input type="text" placeholder="Фамилия" bind:value={lastName}>
                        <input type="text" placeholder="Имя" bind:value={firstName}>
                    </div>
                </div>

                <div class="form-group">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Название книги *</label>
                    <input type="text" placeholder="Название книги" bind:value={bookName}>
                </div>

                <div class="form-group inline-group">
                    <div>
                        <!-- svelte-ignore a11y_label_has_associated_control -->
                        <label>ISBN</label>
                        <input type="text" placeholder="978-5-93673-265-2" bind:value={isbn}>
                    </div>
                    <div>
                        <!-- svelte-ignore a11y_label_has_associated_control -->
                        <label>Год издания *</label>
                        <input type="text" placeholder="2012" bind:value={publicationYear}>
                    </div>
                </div>
            </div>

            <div class="right-column">
                <!-- svelte-ignore a11y_label_has_associated_control -->
                <div class="form-group">
                    <label>Категории *</label>
                    <div></div>
                    <button class="genre-button" on:click={fetchGenres}>{showGenres ? "- Жанр" : "+ Жанр"}</button>
                    {#if showGenres}
                      <div class="dropdown-content">
                        {#each genres as genre}
                          <label>
                            <input type="checkbox" on:change={() => toggleGenre(genre.id)} checked={selectedGenres.has(genre.id)}>
                            {genre.name}
                          </label>
                        {/each}
                      </div>
                    {/if}
                  </div>
            </div>
        </div>
        {/if}

        <button class="next-button" on:click={submitForm}>Далее >></button>
    </section>
</main>

<style>
    .active-tab {
        background: rgb(80, 120, 200);
        color: white;
        font-weight: bold;
        border: 2px solid white;
    }
    .genre-button {
        color: #4da6ff;
        cursor: pointer;
        font-weight: bold;
        border: none;
        background: none;
        padding: 5px 10px;
        transition: color 0.3s;
    }

    .genre-button:hover {
        color: #1a75ff;
    }

    .dropdown-content {
        position: relative;
        width: 100%;
        background: #323232;
        border: 1px solid gray;
        border-radius: 8px;
        padding: 10px;
        max-height: 180px;
        overflow-y: auto;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
        margin-top: 5px;
    }

    .dropdown-content label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px 0;
        font-size: 14px;
        color: white;
    }

    .dropdown-content input[type="checkbox"] {
        width: 16px;
        height: 16px;
    }

    .next-button {
      position: absolute;
      right: 15px;
      bottom: 15px;
      padding: 8px 15px;
      background: rgb(100, 100, 255);
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .next-button:hover {
      background: rgb(80, 80, 230);
    }


    * {
        box-sizing: border-box;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        color: rgba(173, 166, 156, 1);
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
        color: rgba(173, 166, 156, 1);
    }

    .menu-item:hover {
        background: rgb(50, 53, 55);
    }

    .exchange-form {
        background: rgb(42, 45, 47);
        padding: 20px;
        border-radius: 10px;
        max-width: 800px;
        width: 100%;
        position: relative;
        height: 430px;
    }

    .form-title {
        text-align: center;
        font-size: 1.5rem;
        margin-bottom: 20px;
    }

    .tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }

    .tab-button {
        flex: 1;
        padding: 12px;
        cursor: pointer;
        border-radius: 5px;
        font-size: 1rem;
    }

    .tab-button:hover {
        background: rgb(60, 63, 65);
    }

    .exchange-container {
        display: flex;
        justify-content: space-between;
    }

    .left-column {
        width: 48%;
    }

    .right-column {
        width: 48%;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .input-group {
        display: flex;
        gap: 10px;
    }

    .inline-group {
        display: flex;
        gap: 20px;
    }

    input {
        width: 100%;
        padding: 8px;
        margin-top: 5px;
        border: 1px solid gray;
        border-radius: 5px;
        background: rgb(50, 50, 50);
        color: white;
    }

    .dropdown-content label {
        display: flex;
        align-items: center;
        padding: 5px 0;
    }

    .dropdown-content input {
        margin-right: 10px;
    }

    .next-button {
        padding: 8px;
        font-size: 0.9rem;
        background: rgb(100, 100, 255);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        position: absolute;
        right: 10px;
        bottom: 10px;
    }

    .next-button:hover {
        background: rgb(80, 80, 230);
    }

</style>