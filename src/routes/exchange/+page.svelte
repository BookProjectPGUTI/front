<script lang="ts">
    import { onMount } from "svelte";  
    import { userStore, API_BASE_URL } from '$lib/stores'; 
  
    let activeTab = "exchange";
    let genres: { id: number, name: string }[] = [];
    let showGenres = false;
    let selectedGenres = new Set<number>();
    let receiveGenres: { id: number, name: string }[] = [];
    let showReceiveGenres = false;
    let selectedReceiveGenres = new Set<number>();
    let addresses: Array<any> = [];
    let selectedAddress: any = null; 
    let showModal = false;
    
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
    let errors: string[] = [];
    let firstNameAError: string | null = null;
    let lastNameAError: string | null = null;
    let bookNameError: string | null = null;
    let isbnError: string | null = null;
    let publicationYearError: string | null = null;    
    let genresError: string | null = null;
    let receiveGenresError: string | null = null;
    let cityError: string | null = null;
    let streetError: string | null = null;
    let buildingError: string | null = null;
    let houseError: string | null = null;
    let apartmentError: string | null = null;
    let postalCodeError: string | null = null;
    let lastNameError: string | null = null;
    let firstNameError: string | null = null;
    let middleNameError: string | null = null;
    $: {
        if ($userStore) {
            lastName = $userStore.last_name || ''; 
            firstName = $userStore.first_name || '';
            middleName = $userStore.second_name || '';
        }
    }

    function validateForm(): boolean {
    let isValid = true;

    firstNameAError = null;
    lastNameAError = null;
    bookNameError = null;
    isbnError = null;
    publicationYearError = null;
    genresError = null;

    if (!firstNameA.trim()) {
        firstNameAError = "Имя автора не может быть пустым.";
        isValid = false;
    } else if (firstNameA.length > 48) {
        firstNameAError = "Имя автора не может быть длиннее 48 символов.";
        isValid = false;
    } else if (!/^[a-zA-Zа-яА-Я]+$/.test(firstNameA)) {
        firstNameAError = "Имя автора должно содержать только буквы (кириллица или латиница).";
        isValid = false;
    }

    if (!lastNameA.trim()) {
        lastNameAError = "Фамилия автора не может быть пустой.";
        isValid = false;
    } else if (lastNameA.length > 48) {
        lastNameAError = "Фамилия автора не может быть длиннее 48 символов.";
        isValid = false;
    } else if (!/^[a-zA-Zа-яА-Я]+$/.test(lastNameA)) {
        lastNameAError = "Фамилия автора должна содержать только буквы (кириллица или латиница).";
        isValid = false;
    }

    if (!bookName.trim()) {
        bookNameError = "Название книги не может быть пустым.";
        isValid = false;
    } else if (bookName.length > 128) {
        bookNameError = "Название книги не может быть длиннее 128 символов.";
        isValid = false;
    } else if (!/^[a-zA-Zа-яА-Я0-9\s\-.,!?()"'«»]+$/.test(bookName)) {
        bookNameError = "Название книги может содержать только буквы (кириллица или латиница), цифры, кавычки, тире и знаки препинания.";
        isValid = false;
    }

    if (!isbn.trim()) {
        isbnError = "ISBN не может быть пустым.";
        isValid = false;
    } else if (!/^\d{13}$/.test(isbn)) {
        isbnError = "ISBN должен состоять из 13 цифр.";
        isValid = false;
    }

    if (!publicationYear.trim()) {
        publicationYearError = "Год издания не может быть пустым.";
        isValid = false;
    } else if (!/^\d{4}$/.test(publicationYear)) {
        publicationYearError = "Год издания должен быть четырехзначным числом.";
        isValid = false;
    } else if (Number(publicationYear) > 2025) {
        publicationYearError = "Год издания не может быть больше 2025.";
        isValid = false;
    }

    if (selectedGenres.size === 0) {
        genresError = "Выберите хотя бы один жанр.";
        isValid = false;
    }

    return isValid;
}
    function validateReceiveForm(): boolean {
        let isValid = true;

        receiveGenresError = null;

        if (selectedReceiveGenres.size === 0) {
            receiveGenresError = "Выберите хотя бы один жанр.";
            isValid = false;
        }

        return isValid;
    }

    function validateAddressForm(): boolean {
    let isValid = true;

    cityError = null;
    streetError = null;
    buildingError = null;
    houseError = null;
    apartmentError = null;
    postalCodeError = null;
    lastNameError = null;
    firstNameError = null;
    middleNameError = null;

    if (!city.trim()) {
        cityError = "Город не может быть пустым.";
        isValid = false;
    } else if (city.length > 128) {
        cityError = "Город не может быть длиннее 128 символов.";
        isValid = false;
    } else if (!/^[а-яА-ЯёЁ\s-]+$/.test(city)) {
        cityError = "Город должен содержать только кириллицу, пробелы и тире.";
        isValid = false;
    }

    if (!street.trim()) {
        streetError = "Улица не может быть пустой.";
        isValid = false;
    } else if (street.length > 128) {
        streetError = "Улица не может быть длиннее 128 символов.";
        isValid = false;
    } else if (!/^[а-яА-ЯёЁ\s-]+$/.test(street)) {
        streetError = "Улица должна содержать только кириллицу, пробелы и тире.";
        isValid = false;
    }

    if (building.trim()) {
        if (building.length > 128) {
            buildingError = "Строение не может быть длиннее 128 символов.";
            isValid = false;
        } else if (!/^[а-яА-ЯёЁ0-9]{1,2}$/.test(building)) {
            buildingError = "Строение должно содержать только кириллицу или цифры (до 2 символов).";
            isValid = false;
        }
    }

    if (!house.trim()) {
        houseError = "Дом не может быть пустым.";
        isValid = false;
    } else if (house.length > 128) {
        houseError = "Дом не может быть длиннее 128 символов.";
        isValid = false;
    } else if (!/^[0-9]+[а-яА-ЯёЁ]?$/.test(house)) {
        houseError = "Дом должен содержать цифры и возможно 1 букву кириллицы (например: 146А).";
        isValid = false;
    }

    if (!apartment.trim()) {
        apartmentError = "Квартира не может быть пустой.";
        isValid = false;
    } else if (apartment.length > 128) {
        apartmentError = "Квартира не может быть длиннее 128 символов.";
        isValid = false;
    } else if (!/^\d{1,3}$/.test(apartment)) {
        apartmentError = "Квартира должна содержать только цифры (не более 3 символов).";
        isValid = false;
    }

    if (!postalCode.trim()) {
        postalCodeError = "Индекс не может быть пустым.";
        isValid = false;
    } else if (!/^\d{6}$/.test(postalCode)) {
        postalCodeError = "Индекс должен состоять из 6 цифр.";
        isValid = false;
    }

    if (!lastName.trim()) {
        lastNameError = "Фамилия не может быть пустой.";
        isValid = false;
    } else if (lastName.length > 25) {
        lastNameError = "Фамилия не может быть длиннее 25 символов.";
        isValid = false;
    } else if (!/^[а-яА-ЯёЁ]+$/.test(lastName)) {
        lastNameError = "Фамилия должна содержать только кириллицу.";
        isValid = false;
    }

    if (!firstName.trim()) {
        firstNameError = "Имя не может быть пустым.";
        isValid = false;
    } else if (firstName.length > 20) {
        firstNameError = "Имя не может быть длиннее 20 символов.";
        isValid = false;
    } else if (!/^[а-яА-ЯёЁ]+$/.test(firstName)) {
        firstNameError = "Имя должно содержать только кириллицу.";
        isValid = false;
    }

    if (middleName.trim()) {
        if (middleName.length > 25) {
            middleNameError = "Отчество не может быть длиннее 25 символов.";
            isValid = false;
        } else if (!/^[а-яА-ЯёЁ]*$/.test(middleName)) {
            middleNameError = "Отчество должно содержать только кириллицу.";
            isValid = false;
        }
    }

    return isValid;
}
    function showTab(tab: string) {
        activeTab = tab;
        if (tab === "exchange") {
            fetchActiveBook();
        } else if (tab === "receive") {
            fetchWishList();
        } else if (tab === "address") {
            fetchAddresses();
        }
    }   
    function goBack() {
        if (activeTab === 'address') {
            activeTab = 'receive'; 
        } else {
            activeTab = 'exchange';
        }
    }
    function handleNextButtonClick() {
        if (activeTab === "exchange") {
            if (!validateForm()) return;
            submitForm();
            fetchWishList();
        } else if (activeTab === "receive") {
            if (!validateReceiveForm()) return;
            submitWishList();
            fetchAddresses();
        }
    } 
    async function fetchGenres() {
        if (showGenres) {
            showGenres = false;
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/genres`, {
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
        const response = await fetch(`${API_BASE_URL}/genres`, {
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
            const response = await fetch(`${API_BASE_URL}/books`, {
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
        if (!validateForm()) {
            return;
        }

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
                response = await fetch(`${API_BASE_URL}/books`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                    credentials: "include",
                });
            } else {
                response = await fetch(`${API_BASE_URL}/books`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                    credentials: "include",
                });
            }
            if (response.status === 204 || response.status === 201) {
                activeTab = "receive";
            }
        } catch (error) {
            console.error("Ошибка при отправке данных:", error);
            alert("Ошибка при отправке данных");
        }
    }

    async function fetchWishList() {
        try {
            const response = await fetch(`${API_BASE_URL}/wish-list`, {
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
            const response = await fetch(`${API_BASE_URL}/wish-list`, {
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
    if (!validateAddressForm()) {
        return; 
    }
    const addressData = {
            mail_index: postalCode,
            city: city,
            street: street,
            house: house,
            build: building.trim() ? building : null, // Передаем NULL если building пустой
            apartment: apartment,
            is_active: setAsDefault 
        };
    try {
        const userResponse = await fetch(`${API_BASE_URL}/users`, {
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

             if (selectedAddress) {
                const addressResponse = await fetch(`${API_BASE_URL}/users/addresses/${selectedAddress.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(addressData),
                    credentials: "include",
                });

                if (addressResponse.status !== 204) {
                    throw new Error("Ошибка при обновлении адреса");
                }

                console.log("Адрес пользователя успешно обновлен.");
            } else {
                const addressResponse = await fetch(`${API_BASE_URL}/users/addresses`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(addressData),
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
        const response = await fetch(`${API_BASE_URL}/users/addresses`, {
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

        const activeAddress = addresses.find((address: any) => address.is_active);

        if (activeAddress) {
            selectAddress(activeAddress);
            setAsDefault = true;
        }
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
        setAsDefault = address.is_active || false;
    }
    function addNewAddress() {
            selectedAddress = null;
            city = "";
            street = "";
            house = "";
            building = "";
            apartment = "";
            postalCode = "";
            setAsDefault = false;
            closeModal();
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
                        <div class="input-wrapper">
                            <input type="text" placeholder="Фамилия" bind:value={lastNameA}>
                            {#if lastNameAError}
                                <div class="error-message">{lastNameAError}</div>
                            {/if}
                        </div>
                        <div class="input-wrapper">
                            <input type="text" placeholder="Имя" bind:value={firstNameA}>
                            {#if firstNameAError}
                                <div class="error-message">{firstNameAError}</div>
                            {/if}
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Название книги *</label>
                    <input type="text" placeholder="Название книги" bind:value={bookName}>
                    {#if bookNameError}
                        <div class="error-message">{bookNameError}</div>
                    {/if}
                </div>
                <div class="form-group inline-group">
                    <div>
                        <!-- svelte-ignore a11y_label_has_associated_control -->
                        <label>ISBN</label>
                        <input type="text" placeholder="9785936732652" bind:value={isbn}>
                        {#if isbnError}
                            <div class="error-message">{isbnError}</div>
                        {/if}
                    </div>
                    <div>
                        <!-- svelte-ignore a11y_label_has_associated_control -->
                        <label>Год издания *</label>
                        <input type="text" placeholder="2012" bind:value={publicationYear}>
                        {#if publicationYearError}
                            <div class="error-message">{publicationYearError}</div>
                        {/if}
                    </div>
                </div>
            </div>
            <div class="right-column">
                <div class="form-group">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Категории *</label>
                    <div></div>
                    <button class="genre-button" on:click={fetchGenres}>{showGenres ? "- Жанр" : "+ Жанр"}</button>
                    {#if genresError}
                        <div class="error-message">{genresError}</div>
                    {/if}
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
                {#if receiveGenresError}
                    <div class="error-message">{receiveGenresError}</div>
                {/if}
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
        <button class="tab-button" on:click={openModal}>Выбрать адрес</button>
        <div class="address-container">
            <div class="address-column">
                <div class="form-group">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Город *</label>
                    <input type="text" placeholder="Москва" bind:value={city}>
                    {#if cityError}
                        <div class="error-message">{cityError}</div>
                    {/if}
                </div>
                <div class="form-group">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Улица *</label>
                    <input type="text" placeholder="Название улицы" bind:value={street}>
                    {#if streetError}
                        <div class="error-message">{streetError}</div>
                    {/if}
                </div>
                <div class="inline-address-group">
                    <div class="form-group">
                        <!-- svelte-ignore a11y_label_has_associated_control -->
                        <label>Строение</label>
                        <input type="text" placeholder="номер" bind:value={building}>
                        {#if buildingError}
                            <div class="error-message">{buildingError}</div>
                        {/if}
                    </div>
                    <div class="form-group">
                        <!-- svelte-ignore a11y_label_has_associated_control -->
                        <label>Дом</label>
                        <input type="text" placeholder="дом" bind:value={house}>
                        {#if houseError}
                            <div class="error-message">{houseError}</div>
                        {/if}
                    </div>
                    <div class="form-group">
                        <!-- svelte-ignore a11y_label_has_associated_control -->
                        <label>Квартира *</label>
                        <input type="text" placeholder="квартира" bind:value={apartment}>
                        {#if apartmentError}
                            <div class="error-message">{apartmentError}</div>
                        {/if}
                    </div>
                </div>
                <div class="form-group">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Индекс *</label>
                    <input type="text" placeholder="индекс" bind:value={postalCode}>
                    {#if postalCodeError}
                        <div class="error-message">{postalCodeError}</div>
                    {/if}
                </div>
                <div class="form-group default-address-container">
                    <label class="default-address-label">
                        <input type="checkbox" bind:checked={setAsDefault}> Сделать адресом по умолчанию
                    </label>
                </div>
            </div>
            <div class="address-column">
                <div class="form-group">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Фамилия *</label>
                    <input type="text" placeholder="Иванов" bind:value={lastName}>
                    {#if lastNameError}
                        <div class="error-message">{lastNameError}</div>
                    {/if}
                </div>
                <div class="form-group">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Имя *</label>
                    <input type="text" placeholder="Имя" bind:value={firstName}>
                    {#if firstNameError}
                        <div class="error-message">{firstNameError}</div>
                    {/if}
                </div>
                <div class="form-group">
                    <!-- svelte-ignore a11y_label_has_associated_control -->
                    <label>Отчество (при наличии)</label>
                    <input type="text" placeholder="Отчество" bind:value={middleName}>
                    {#if middleNameError}
                        <div class="error-message">{middleNameError}</div>
                    {/if}
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
                <button on:click={addNewAddress}>Добавить адрес</button> <!-- Новая кнопка -->
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
    .default-address-container {
        margin-top: 10px;
    }

    .default-address-label {
        display: inline-flex;
        align-items: center; 
        gap: 8px; 
        cursor: pointer; 
        font-size: 1rem; 
        color: #333; 
    }

    .default-address-label input[type="checkbox"] {
        margin: 0;
        width: 16px;
        height: 16px;
        cursor: pointer;
    }
    .error-message {
        color: red;
        font-size: 0.690rem;
        margin-top: 0.25rem;
    }   
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .modal {
        background-color: #fff;
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
        color:#333;
        background: #f9f9f9;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
        color: #333;
        border: 2px solid transparent;
        transition: border-color 0.3s ease, background-color 0.3s ease;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .menu-item:hover {
        background: #ccc;
        border-color: #ccc;
    }
    .exchange-form {
        background: #fff;
        padding: 20px;
        border-radius: 10px;
        max-width: 800px;
        width: 100%;
        position: relative;
        height: 700px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
        background: #00aaff;
        border-color: #4da6ff;
    }
    .active-tab {
        background: #00aaff;
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
        background: #f9f9f9;    
        color: #000000;
        transition: border-color 0.3s ease;
    }
    input:focus {
        border-color: #00aaff;
        outline: none;
    }
    .genre-button {
        color: #00aaff;
        cursor: pointer;
        font-weight: bold;
        border: 2px solid transparent;
        background: none;
        padding: 5px 10px;
        transition: color 0.3s ease, border-color 0.3s ease;
    }
    .genre-button:hover {
        color: #00aaff;
        border-color: #4da6ff;
    }
    .dropdown-content {
        position: relative;
        width: 100%;
        background: #fff;
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
        color: rgb(0, 0, 0);
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
        background: #00aaff;
        color: white;
        border: 2px solid transparent;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: border-color 0.3s ease, background-color 0.3s ease;
    }
    .back-button:hover, .next-button:hover {
        background: #4da6ff;
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
    .input-group {
    display: flex;
    gap: 10px;
    }

    .input-wrapper {
        flex: 1; 
        display: flex;
        flex-direction: column; 
    }

    .input-wrapper input {
        width: 100%; 
    }

</style>