<script lang="ts">
  import { writable } from "svelte/store";
  
  let email: string = "";
  let username: string = "";
  let password: string = "";
  let error = writable<string>("");
  let showPopup = writable<boolean>(false);

  // Функция валидации email
  const validateEmailFormat = (email: string): string => {
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

  const validateOnBlur = () => {
    const validationError = validateEmailFormat(email);
    if (validationError) {
      error.set(validationError);
      showPopup.set(true);
    } else {
      error.set("");
      showPopup.set(false);
    }
  };

  const handleEmailInput = () => {
    if (!email.trim()) {
      error.set(""); // Если поле пустое, убираем сообщение об ошибке
      showPopup.set(false); // Скрываем уведомление
      return;
    }

    const validationError = validateEmailFormat(email);
    if (validationError) {
      error.set(validationError);
      showPopup.set(true);
    } else {
      error.set("");
      showPopup.set(false);
    }
  };

  const handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    error.set("");
    showPopup.set(false);

    const validationError = validateEmailFormat(email);
    if (validationError) {
      error.set(validationError);
      showPopup.set(true);
      return;
    }

    const payload = { email, username, password };

    try {
      const response = await fetch("/v1/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Ошибка регистрации");

      alert("Регистрация прошла успешно. Подтвердите почту");
    } catch (err: any) {
      error.set(err.message);
      showPopup.set(true);
    }
  };
</script>

<style>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: rgba(27,30,31);
  }

  .form-wrapper {
    background: rgba(24,26,27);
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    color: rgba(173, 166, 156, 1);
  }

  h2 {
    text-align: center;
    margin-bottom: 0.5rem; /* Уменьшил отступ */
  }

  /* Popup теперь ниже заголовка */
  .popup {
    background: rgba(26, 28, 29);
    color: rgba(173, 166, 156, 1);
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
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
    width: 100%; /* Обеспечивает, что поле ввода будет шириной 100% */
    padding: 0.5rem;
    border: 1px solid rgba(18,18,18);
    border-radius: 5px;
    background-color: rgba(27, 30, 31);  /* Цвет фона поля ввода */
    color: rgba(173, 166, 156, 1);  /* Цвет текста в поле */
    box-sizing: border-box;  /* Учитывает padding при расчете ширины */
  }

  button {
    width: 100%; /* Обеспечивает, что кнопка будет шириной 100% */
    padding: 0.7rem;
    border: none;
    background: #007bff;
    color: rgba(18,18,18);
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    box-sizing: border-box;  /* Учитывает padding при расчете ширины */
  }

  button:hover {
    background: #0056b3;
  }
</style>

<div class="container">
  <div class="form-wrapper">
    <h2>Регистрация</h2>

    <!-- Popup теперь под заголовком -->
    {#if $showPopup}
      <div class="popup show">{$error}</div>
    {/if}

    <form on:submit={handleSubmit}>
      <div class="form-group">
        <label for="email">Почта:</label>
        <input type="email" id="email" bind:value={email} required on:blur={validateOnBlur} on:input={handleEmailInput} />
      </div>
      <div class="form-group">
        <label for="username">Никнейм:</label>
        <input type="text" id="username" bind:value={username} required />
      </div>
      <div class="form-group">
        <label for="password">Пароль:</label>
        <input type="password" id="password" bind:value={password} required />
      </div>
      <button type="submit">Зарегистрироваться</button>
    </form>
  </div>
</div>
