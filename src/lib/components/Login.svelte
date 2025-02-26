<script lang="ts">
  import { writable } from "svelte/store";

  export let isOpen = writable(false);
  let email: string = "";
  let password: string = "";
  let error = writable<string>("");
  let showPopup = writable<boolean>(false);
  let popupMessage = writable<string>("");
  let emailTouched = writable<boolean>(false); // флаг для отслеживания ввода

  // Функция для проверки email
  const validateEmail = (email: string): string => {
    const invalidCharsRegex = /[^a-zA-Z0-9._@-]/;
    if (invalidCharsRegex.test(email)) {
      return 'Почта должна содержать только английские символы, цифры, точки, дефисы и подчеркивания.';
    }
    if (!email.includes('@')) return 'Отсутствует символ @.';
    const [localPart, domainPart] = email.split('@');
    if (!localPart) return 'Локальная часть адреса не может быть пустой.';
    if (!domainPart) return 'Отсутствует доменная часть в почтовом адресе.';
    return '';  // Почта валидна
  };

  // Обработчик формы
  const handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    popupMessage.set("");
    showPopup.set(true);

    const validationError = validateEmail(email);
    if (validationError) {
      popupMessage.set(validationError);
      return;
    }

    try {
      const response = await fetch("/v1/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Ошибка входа");

      popupMessage.set("Вы успешно вошли!");
    } catch (err: any) {
      popupMessage.set(err.message);
    }

    setTimeout(() => showPopup.set(false), 3000);
  };

  // Валидация при потере фокуса
  const validateOnBlur = () => {
    emailTouched.set(true); // Устанавливаем флаг, что поле было затронуто
    const validationError = validateEmail(email);
    if (validationError) {
      popupMessage.set(validationError);
      showPopup.set(true);
    } else {
      popupMessage.set("");
      showPopup.set(false);
    }
  };

  // Валидация при вводе
  const handleEmailInput = () => {
    if (!email.trim()) {
      popupMessage.set(""); // Если поле пустое, убираем сообщение об ошибке
      showPopup.set(false); // Скрываем уведомление
      return;
    }

    if (!$emailTouched) return; // Ошибка не показывается, пока поле не было затронуто
    const validationError = validateEmail(email);
    if (validationError) {
      popupMessage.set(validationError);
      showPopup.set(true);
    } else {
      popupMessage.set("");
      showPopup.set(false);
    }
  };

  // Закрытие формы при клике вне её
  const handleOutsideClick = (event: MouseEvent) => {
    const modal = document.querySelector(".form-wrapper");
    if (modal && !modal.contains(event.target as Node)) {
      isOpen.set(false);
    }
  };
</script>

{#if $isOpen}
  <div class="modal" on:click={handleOutsideClick}>
    <div class="form-wrapper">
      <h2>Вход</h2>

      <!-- Уведомление теперь внутри формы под заголовком -->
      {#if $showPopup}
        <div class="popup show">{$popupMessage}</div>
      {/if}

      <form on:submit={handleSubmit}>
        <div class="form-group">
          <label for="email">Почта:</label>
          <input 
            type="email" 
            id="email" 
            bind:value={email} 
            required 
            on:blur={validateOnBlur}
            on:input={handleEmailInput}
          />
        </div>
        <div class="form-group">
          <label for="password">Пароль:</label>
          <input type="password" id="password" bind:value={password} required />
        </div>

        <button type="submit">Войти</button>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .form-wrapper {
    background:  rgba(27,30,31); /* Цвет фона формы */
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
    position: relative;
    color: rgba(173, 166, 156); /* Цвет текста в форме */
  }

  h2 {
    margin-bottom: 0.5rem;
  }

  /* Переместил popup внутрь формы, под заголовок */
  .popup {
    background: rgba(26, 28, 29); /* Цвет фона уведомления */
    color: rgba(173, 166, 156); /* Цвет текста уведомления */
    padding: 10px 20px;
    border-radius: 6px;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
    font-weight: 600;
    text-align: center;
    margin-bottom: 1rem; /* Отступ вниз */
    display: none;
  }

  .popup.show {
    display: block;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid rgba(18,18,18); /* Цвет границы поля */
    border-radius: 5px;
    background: rgba(24, 26, 27); /* Цвет фона полей ввода */
    color: rgba(173, 166, 156); /* Цвет текста в поле ввода */
  }

  button {
    width: 100%;
    padding: 0.7rem;
    border: none;
    background: #007bff; /* Цвет кнопки */
    color: rgba(18,18,18); /* Цвет текста на кнопке */
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background: rgba(150, 140, 130); /* Цвет кнопки при наведении */
  }
</style>
