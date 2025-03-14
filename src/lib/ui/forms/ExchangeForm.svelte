<script lang="ts">
  import { writable } from "svelte/store";
  import WantToExchangeForm from "./WantToExchangeForm.svelte";
  import ReceiveForm from "./ReceiveForm.svelte";
  export let close: () => void;
  export let bookData: { [key: string]: string } | null = null;
  // Используем writable store для состояния текущей формы
  let currentForm = writable("exchange"); // Возможные значения: "exchange", "wantToExchange", "receive"

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

  // Функции для переключения между формами
  
  const openExchangeForm = () => {
    currentForm.set("")
    currentForm.set("exchange")
    console.log(' openWantForm:', $currentForm);
    
  };
  const openWantToExchangeForm = () => {
    currentForm.set("")
    currentForm.set("wantToExchange");
    console.log(' openWantForm:', $currentForm);
    
  };

  const openReceiveForm = () => {
    currentForm.set("")
    currentForm.set("receive");
    console.log(' openReceiveForm:', $currentForm);
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
  </div>
{/if}

{#if $currentForm === "wantToExchange"}
  <WantToExchangeForm close={close}
  
    openExchangeForm={openExchangeForm}
    openReceiveForm={openReceiveForm}
    showWantToExchangeForm={true}  
    bookData={bookData} />
{/if}

{#if $currentForm === "receive"}
  <ReceiveForm close={close} />
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
</style>
