    <script lang="ts">
        import { onMount } from "svelte";  
        import { userStore } from '$lib/stores'; 
      
        let activeTab = "exchange";
        let genres: { id: number, name: string }[] = [];
        let showGenres = false;
        let selectedGenres = new Set<number>();

        let receiveGenres: { id: number, name: string }[] = [];
        let showReceiveGenres = false;
        let selectedReceiveGenres = new Set<number>();
        let addresses: Array<any> = [];
        let selectedAddress: any = null; // Для хранения выбранного адреса
        let showModal = false; // Состояние для показа модального окна
        
    
        let city = "";
        let street = "";
        let building = "";
        let house = "";
        let apartment = "";
        let postalCode = "";
        let setAsDefault = false;
            
        let lastName = "";
        let firstName = "";
        let middleName = "";    

        let firstNameA = "";
        let lastNameA = "";
        let bookName = "";
        let isbn = "";
        let publicationYear = "";
        let bookId: string | null = null; 
        let isGetSuccessful = false; 
        let originalData: any = null;

        $: {
            if ($userStore) {
                lastName = $userStore.last_name || ''; 
                firstName = $userStore.first_name || '';
                middleName = $userStore.second_name || '';
            }
        }


        function showTab(tab: string) {
        activeTab = tab;
        if (tab === "exchange") {
            fetchActiveBook();
        } else if (tab === "receive") {
            fetchWishList();
        }}

        function goBack() {
            if (activeTab === 'address') {
                activeTab = 'receive'; 
            } else {
                activeTab = 'exchange';
            }
        }


        function handleNextButtonClick() {
            if (activeTab === "exchange") {
                submitForm();
                fetchWishList();
            } else if (activeTab === "receive") {
                submitWishList();
            }}

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

        async function fetchReceiveGenres() {
        if (showReceiveGenres) {
            showReceiveGenres = false;
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
            receiveGenres = data.genres || [];
            showReceiveGenres = true;
        } catch (error) {
            console.error("Ошибка при загрузке жанров:", error);
        }}

        function toggleReceiveGenre(genreId: number) {
        if (selectedReceiveGenres.has(genreId)) {
            selectedReceiveGenres.delete(genreId);
        } else {
            selectedReceiveGenres.add(genreId);
        }}

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
                    firstNameA = data.author.first_name;
                    lastNameA = data.author.last_name;
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
                    first_name: firstNameA,
                    last_name: lastNameA
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

    async function fetchWishList() {
        try {
            const response = await fetch("http://localhost:8000/api/v1/wish-list", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) throw new Error("Ошибка загрузки списка желаемых жанров");

            const data = await response.json();
            selectedReceiveGenres = new Set(data.genres.map((g: { id: number }) => g.id));
        } catch (error) {
            console.error("Ошибка при загрузке списка желаемых жанров:", error);
        }}

    async function submitWishList() {
        const requestBody = {
            genres_ids: Array.from(selectedReceiveGenres)
        };
        try {
            const response = await fetch("http://localhost:8000/api/v1/wish-list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
                credentials: "include",
            });
            if (response.status === 201) {
                console.log("Список желаемых жанров успешно сохранен.");
                activeTab = "address";
            } else {
                throw new Error("Ошибка сохранения списка желаемых жанров");
            }
        } catch (error) {
            console.error("Ошибка при отправке списка желаемых жанров:", error);
            alert("Ошибка при отправке данных");
        }
    }    

    async function confirmAddress() {
        try {
            // Шаг 1: Обновление данных пользователя (ФИО)
            const userResponse = await fetch("http://localhost:8000/api/v1/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    second_name: middleName
                }),
                credentials: "include",
            });

            if (userResponse.status !== 204) {
                throw new Error("Ошибка при обновлении ФИО");
            }

            console.log("ФИО пользователя успешно обновлено.");

            // Шаг 2: Добавление/Обновление адреса
            if (selectedAddress) {
                // Обновляем существующий адрес
                const addressResponse = await fetch(`http://localhost:8000/api/v1/users/addresses/${selectedAddress.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        mail_index: postalCode,
                        city: city,
                        street: street,
                        house: house,
                        build: building,
                        apartment: apartment,
                        is_active: true
                    }),
                    credentials: "include",
                });

                if (addressResponse.status !== 204) {
                    throw new Error("Ошибка при обновлении адреса");
                }

                console.log("Адрес пользователя успешно обновлен.");
            } else {
                // Добавляем новый адрес
                const addressResponse = await fetch("http://localhost:8000/api/v1/users/addresses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        mail_index: postalCode,
                        city: city,
                        street: street,
                        house: house,
                        build: building,
                        apartment: apartment,
                        is_active: true
                    }),
                    credentials: "include",
                });

                if (addressResponse.status !== 201) {
                    throw new Error("Ошибка при добавлении адреса");
                }

                console.log("Адрес пользователя успешно добавлен.");
            }

        
        } catch (error) {
            console.error("Ошибка:", error);
        }
    }

    async function fetchAddresses() {
        try {
            const response = await fetch("http://localhost:8000/api/v1/users/addresses", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Ошибка загрузки адресов");
            }

            const data = await response.json();
            addresses = data.addresses || [];
        } catch (error) {
            console.error("Ошибка при загрузке адресов:", error);
        }
    }

    function openModal() {
        showModal = true;
    }
    function closeModal() {
        showModal = false;
    }
    function selectAddress(address: any) {
        selectedAddress = address;
        closeModal();
        city = address.city;
        street = address.street;
        house = address.house;
        building = address.build;
        apartment = address.apartment;
        postalCode = address.mail_index;
    }

        onMount(fetchActiveBook);
        onMount(fetchAddresses);
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
                            <input type="text" placeholder="Фамилия" bind:value={lastNameA}>
                            <input type="text" placeholder="Имя" bind:value={firstNameA}>
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
                            <input type="text" placeholder="9785936732652" bind:value={isbn}>
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
            {#if activeTab === 'receive'}
            <div class="receive-container">
                <div class="form-group">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Категории *</label>
                    <button class="genre-button" on:click={fetchReceiveGenres}>
                        {showReceiveGenres ? "- Жанр" : "+ Жанр"}
                    </button>
                    {#if showReceiveGenres}
                    <div class="dropdown-content">
                        {#each receiveGenres as genre}
                        <label>
                            <input type="checkbox" on:change={() => toggleReceiveGenre(genre.id)} checked={selectedReceiveGenres.has(genre.id)}>
                            {genre.name}
                        </label>
                        {/each}
                    </div>
                    {/if}
                </div>
            </div>
            {/if}        
            {#if activeTab === 'address'}
            <button on:click={openModal}>Выбрать адрес</button>
            <div class="address-container">
                <div class="address-column">
                    <div class="form-group">
                        <label>Город *</label>
                        <input type="text" placeholder="Москва" bind:value={city}>
                    </div>
                    <div class="form-group">
                        <label>Улица *</label>
                        <input type="text" placeholder="Название улицы" bind:value={street}>
                    </div>
                    
                    <div class="inline-address-group">
                        <div class="form-group">
                            <label>Строение *</label>
                            <input type="text" placeholder="номер" bind:value={building}>
                        </div>
                        <div class="form-group">
                            <label>Дом *</label>
                            <input type="text" placeholder="дом" bind:value={house}>
                        </div>
                        <div class="form-group">
                            <label>Квартира</label>
                            <input type="text" placeholder="квартира" bind:value={apartment}>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Индекс *</label>
                        <input type="text" placeholder="индекс" bind:value={postalCode}>
                    </div>
                </div>
                <div class="address-column">
                    <div class="form-group">
                        <label>Фамилия *</label>
                        <input type="text" placeholder="Иванов" bind:value={lastName}>
                    </div>
                    <div class="form-group">
                        <label>Имя *</label>
                        <input type="text" placeholder="Имя" bind:value={firstName}>
                    </div>
                    <div class="form-group">
                        <label>Отчество (при наличии) *</label>
                        <input type="text" placeholder="Отчество" bind:value={middleName}>
                    </div>
                </div>
            </div>
            {/if}
            <div class="button-container">
                {#if activeTab === 'receive' || activeTab === 'address'}
                    <button class="back-button" on:click={goBack}>&lt;&lt; Назад</button>
                {/if}
                {#if activeTab === 'receive' || activeTab === 'exchange'}
                <button class="next-button" on:click={handleNextButtonClick}>Далее &gt;&gt;</button>
                {/if}
                {#if activeTab === 'address'}
                <button class="next-button" on:click={confirmAddress}>Подтвердить данные</button>
                {/if}
            </div>
            {#if showModal}
            <div class="modal-overlay">
                <div class="modal">
                    <h2>Выберите адрес</h2>
                    <ul>
                        {#each addresses as address}
                            <li>
                                <button on:click={() => selectAddress(address)}>
                                    {address.city}, {address.street}, {address.house}, {address.build}, {address.apartment}
                                </button>
                            </li>
                        {/each}
                    </ul>
                    <button on:click={closeModal}>Закрыть</button>
                </div>
            </div>
        {/if}
        </section>
    </main>

    <style>
        * {
            box-sizing: border-box;
        }
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .modal {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .modal button {
            margin-top: 10px;
        }
        .address-container {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-top: 20px;
        }

        .address-column {
            width: 48%;
        }

        .address-column .form-group {
            width: 100%;
        }

        .address-column .form-group label {
            display: block;
            margin-bottom: 10px;
            font-weight: bold;
            text-align: left;
        }

        .address-column input {
            width: 100%;
        }

        /* Стили для группы полей "Строение", "Дом" и "Квартира" */
        .inline-address-group {
            display: flex;
            gap: 10px;
        }

        .inline-address-group .form-group {
            flex: 1;
        }

        .inline-address-group .form-group input {
            width: 100%;
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
            border: 2px solid transparent;
            transition: border-color 0.3s ease, background-color 0.3s ease;
        }

        .menu-item:hover {
            background: rgb(50, 53, 55);
            border-color: #4da6ff;
        }

        .exchange-form {
            background: rgb(42, 45, 47);
            padding: 20px;
            border-radius: 10px;
            max-width: 800px;
            width: 100%;
            position: relative;
            height: 550px;
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
            border: 2px solid transparent;
            transition: border-color 0.3s ease, background-color 0.3s ease;
        }

        .tab-button:hover {
            background: rgb(60, 63, 65);
            border-color: #4da6ff;
        }

        .active-tab {
            background: rgb(80, 120, 200);
            color: white;
            font-weight: bold;
            border: 2px solid #4da6ff;
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
            transition: border-color 0.3s ease;
        }

        input:focus {
            border-color: #4da6ff;
            outline: none;
        }

        .genre-button {
            color: #4da6ff;
            cursor: pointer;
            font-weight: bold;
            border: 2px solid transparent;
            background: none;
            padding: 5px 10px;
            transition: color 0.3s ease, border-color 0.3s ease;
        }

        .genre-button:hover {
            color: #1a75ff;
            border-color: #4da6ff;
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
            transition: border-color 0.3s ease;
        }

        .dropdown-content:hover {
            border-color: #4da6ff;
        }

        .dropdown-content label {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px 0;
            font-size: 14px;
            color: white;
            border-radius: 5px;
            transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .dropdown-content label:hover {
            background-color: rgba(77, 166, 255, 0.1);
            border: 1px solid #4da6ff;
        }

        .dropdown-content input[type="checkbox"] {
            width: 16px;
            height: 16px;
        }

        .button-container {
            position: absolute;
            left: 15px;
            right: 15px;
            bottom: 15px;
            display: flex;
            justify-content: space-between;
        }

        .back-button, .next-button {
            padding: 8px 15px;
            background: rgb(100, 100, 255);
            color: white;
            border: 2px solid transparent;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: border-color 0.3s ease, background-color 0.3s ease;
        }

        .back-button:hover, .next-button:hover {
            background: rgb(80, 80, 230);
            border-color: #4da6ff;
        }

        .back-button {
            position: absolute;
            left: 10px;
            bottom: 5px;
        }

        .next-button {
            position: absolute;
            right: 10px;
            bottom: 5px;
        }

        .receive-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding-left: 20px;
            margin-left: 32%;
        }

        .form-group {
            width: 100%;
            max-width: 300px;
        }

        .form-group label {
            display: block;
            margin-bottom: 10px;
            font-weight: bold;
            text-align: left;
        }
    </style>