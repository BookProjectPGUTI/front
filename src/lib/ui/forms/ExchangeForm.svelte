<script lang="ts">
  import { writable } from "svelte/store";
  import WantToExchangeForm from "./WantToExchangeForm.svelte";
  import ReceiveForm from "./ReceiveForm.svelte";
  export let close: () => void;
  export let bookData: { [key: string]: string } | null = null;

  // Используем writable store для состояния текущей формы
  let currentForm = writable("exchange");

  // Стейт для формы
  let city = "";
  let street = "";
  let building = "";
  let house = "";
  let apartment = "";
  let zipCode = "";
  let isDefault = false;
  let lastName = "";
  let firstName = "";
  let patronymic = "";

  // Стейт для жанров
  let genres: string[] = [];
  let selectedGenres: string[] = [];

  // Стейт для адресов
  let userAddresses: any[] = [];
  let selectedAddress: any = null;

  // Функция для обновления жанров
  function updateGenres(newGenres: string[]) {
    selectedGenres = newGenres;
    console.log("Обновленные жанры:", selectedGenres);
  }

  // Функция для загрузки адресов пользователя
  const loadUserAddresses = async () => {
    try {
      const res = await fetch("v1/users/addresses");
      if (res.ok) {
        const data = await res.json();
        userAddresses = data || [];
        console.log("Адреса пользователя:", userAddresses);
        // Можно выбрать первый адрес как текущий
        if (userAddresses.length > 0) {
          selectedAddress = userAddresses[0]; // По умолчанию выберем первый адрес
          city = selectedAddress.city || "";
          street = selectedAddress.street || "";
          building = selectedAddress.building || "";
          house = selectedAddress.house || "";
          apartment = selectedAddress.apartment || "";
          zipCode = selectedAddress.zipCode || "";
          isDefault = selectedAddress.isDefault || false;
        }
      } else {
        handleError(res);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ошибка при загрузке адресов");
    }
  };

  // Функция для обработки ошибок
  const handleError = (res: Response) => {
    if (res.status === 401) {
      alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
      // Можно перенаправить на страницу авторизации
      window.location.href = "/login";
    } else if (res.status === 404) {
      alert("Пользователь не найден.");
    } else {
      alert("Произошла ошибка. Попробуйте еще раз.");
    }
  };

  // Функция для отправки данных пользователя и адреса
  const handleSubmit = async () => {
    if (!city || !street || !building || !house || !apartment || !zipCode || !lastName || !firstName || !patronymic) {
      alert("Пожалуйста, заполните все поля.");
      return;
    }

    // Подготовка данных для PUT и POST запросов
    const userData = {
      lastName,
      firstName,
      patronymic,
    };

    const addressData = {
      city,
      street,
      building,
      house,
      apartment,
      zipCode,
      isDefault,
    };

    try {
      // Отправка PUT запроса для обновления ФИО
      const userRes = await fetch("v1/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!userRes.ok) {
        handleError(userRes);
        return;
      }

      // Если выбран существующий адрес, обновляем его
      if (selectedAddress) {
        const addressRes = await fetch(`v1/users/addresses/${selectedAddress.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addressData),
        });

        if (!addressRes.ok) {
          handleError(addressRes);
          return;
        }
      } else {
        // Если нет выбранного адреса, отправляем новый
        const addressRes = await fetch("v1/users/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addressData),
        });

        if (!addressRes.ok) {
          handleError(addressRes);
          return;
        }
      }

      alert("Данные успешно обновлены!");

      // Переключение на форму "receive" после успешной отправки данных
      currentForm.set("receive");

    } catch (error) {
      alert(error instanceof Error ? error.message : "Ошибка при отправке данных");
    }
  };

  // Функции для переключения между формами
  const openExchangeForm = () => {
    currentForm.set("");
    currentForm.set("exchange");
  };

  const openWantToExchangeForm = () => {
    currentForm.set("");
    currentForm.set("wantToExchange");
  };

  const openReceiveForm = async () => {
    try {
      const res = await fetch("v1/wish-list");
      if (res.ok) {
        const data = await res.json();
        selectedGenres = data.genres || [];
        console.log("Выбранные жанры:", selectedGenres);
      } else {
        handleError(res);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ошибка при загрузке жанров");
    }

    await loadUserAddresses();
    currentForm.set("receive");
  
  };
</script>

{#if $currentForm === "exchange"}
  <div class="form-container">
    <div class="button-group">
      <button class="start-exchange-btn" on:click={openWantToExchangeForm}>Хочу обменять</button>
      <button class="start-exchange-btn" on:click={openReceiveForm}>Хочу получить</button>
    </div>
    <h2>Адрес доставки</h2>
    <div class="form-content">
      <div class="left-block">
        <div class="form-group">
          <label for="city">Город</label>
          <input type="text" id="city" bind:value={city} placeholder="Введите город" />
        </div>

        <div class="form-group">
          <label for="street">Улица</label>
          <input type="text" id="street" bind:value={street} placeholder="Введите улицу" />
        </div>

        <div class="form-group">
          <label for="building">Строение</label>
          <input type="text" id="building" bind:value={building} placeholder="Введите строение" />
        </div>

        <div class="form-group">
          <label for="house">Дом</label>
          <input type="text" id="house" bind:value={house} placeholder="Введите дом" />
        </div>

        <div class="form-group">
          <label for="apartment">Квартира</label>
          <input type="text" id="apartment" bind:value={apartment} placeholder="Введите квартиру" />
        </div>

        <div class="form-group">
          <label for="zipCode">Почтовый индекс</label>
          <input type="text" id="zipCode" bind:value={zipCode} placeholder="Введите почтовый индекс" />
        </div>

        <div class="checkbox-container">
          <input type="checkbox" id="isDefault" bind:checked={isDefault} />
          <label for="isDefault">Установить как основной адрес</label>
        </div>
      </div>

      <div class="right-block">
        <div class="form-group">
          <label for="lastName">Фамилия</label>
          <input type="text" id="lastName" bind:value={lastName} placeholder="Введите фамилию" />
        </div>

        <div class="form-group">
          <label for="firstName">Имя</label>
          <input type="text" id="firstName" bind:value={firstName} placeholder="Введите имя" />
        </div>

        <div class="form-group">
          <label for="patronymic">Отчество</label>
          <input type="text" id="patronymic" bind:value={patronymic} placeholder="Введите отчество" />
        </div>
      </div>
    </div>
    
    <button class="go-back-btn" on:click={handleSubmit}>Подтвердить данные</button>
    <button class="go-back-btn" on:click={openReceiveForm}>Назад</button>
    
  </div>
{/if}

{#if $currentForm === "receive"}
  <ReceiveForm close={close} 
    selectedGenres={selectedGenres} 
    updateGenres={updateGenres} />
{/if}


<style>
  .form-container {
    width: 100%;
    max-width: 700px;
    margin: 20px auto;
    background: rgb(42, 45, 47);
    color: rgba(173, 166, 156, 1);
    padding: 20px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .form-content {
    display: flex;
    justify-content: space-between;
  }

  .left-block,
  .right-block {
    width: 48%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .form-group input {
    padding: 8px;
    border: 1px solid rgba(173, 166, 156, 0.5);
    background: rgb(50, 53, 55);
    color: rgba(173, 166, 156, 1);
    border-radius: 5px;
    outline: none;
  }

  .checkbox-container {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .button-group {
    display: flex;
    justify-content: space-between;
    gap: 10px; /* Отступ между кнопками */
  }

  .start-exchange-btn,
  .go-back-btn {
    flex: 1;
    padding: 10px;
    background: rgb(42, 45, 47);
    color: rgba(173, 166, 156, 1);
    border: 1px solid rgba(173, 166, 156, 0.5);
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .start-exchange-btn:hover,
  .go-back-btn:hover {
    background: rgb(50, 53, 55);
    border-color: rgba(173, 166, 156, 1);
  }
</style>
