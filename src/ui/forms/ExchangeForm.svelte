<script lang="ts">
  import type { Writable } from "svelte/store";

  export let showExchangeForm: Writable<boolean>;
  export let close: () => void;

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
</script>

<div class="form-container">
  <h2>Адрес доставки</h2>
  <button class="close-btn" on:click={close}>&times;</button>

  <div class="form-content">
    <!-- Левый блок - Адрес -->
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
        <label for="isDefault">Сделать адресом по умолчанию</label>
      </div>
    </div>

    <!-- Правый блок - ФИО -->
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
        <label for="patronymic">Отчество (если имеется)</label>
        <input type="text" id="patronymic" bind:value={patronymic} placeholder="Введите отчество" />
      </div>
    </div>
  </div>

  <!-- Кнопка назад -->
  <button 
    class="back-btn" 
    on:click={() => showExchangeForm.set(false)} 
    aria-label="Назад в форму обмена книги">
    Назад
  </button>
</div>

<style>
  .form-container {
    background: rgb(42, 45, 47);
    color: rgba(173, 166, 156, 1);
    padding: 20px;
    border-radius: 10px;
    width: 700px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    gap: 15px;
    z-index: 10;
  }

  .form-content {
    display: flex;
    gap: 20px;
  }

  .left-block, .right-block {
    flex: 1;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .form-group label {
    font-weight: bold;
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

  .checkbox-container {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .back-btn {
    padding: 10px;
    background: rgb(42, 45, 47);
    border-radius: 8px;
    color: rgba(173, 166, 156, 1);
    border: none;
    cursor: pointer;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 24px;
    color: rgba(173, 166, 156, 1);
    cursor: pointer;
  }
</style>
