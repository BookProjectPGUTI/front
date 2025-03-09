<script lang="ts">
  import { writable } from "svelte/store";
  import { navigate } from 'svelte-routing'; // Импортируем для перенаправления

  export let isOpen = writable(false);
  let email: string = "";
  let password: string = "";
  let error = writable<string>("");
  let showPopup = writable<boolean>(false);
  let popupMessage = writable<string>("");
  let emailTouched = writable<boolean>(false); // флаг для отслеживания ввода
  let passwordTouched = writable<boolean>(false); // флаг для отслеживания ввода пароля

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
    
    // Проверка домена на наличие точки и минимум двух символов после неё
    const domainParts = domainPart.split('.');
    if (domainParts.length < 2 || domainParts[1].length < 2) {
      return "Некорректный формат домена (пример: example.com).";
    }
    
    return '';  // Почта валидна
  };

  // Функция валидации пароля
  const validatePasswordFormat = (password: string): string => {
    if (!password.trim()) return ""; 
    if (/[а-яА-ЯёЁ]/.test(password)) return "Пароль не должен содержать кириллицу.";
    if (password.length < 8) return "Пароль должен содержать минимум 8 символов.";
    if (!/[A-Z]/.test(password)) return "Пароль должен содержать хотя бы одну заглавную букву.";
    if (!/[0-9]/.test(password)) return "Пароль должен содержать хотя бы одну цифру.";
    return ""; // Убираем "Неудовлетворительный пароль"
  };

  // Обработчик формы
  const handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    popupMessage.set("");
    showPopup.set(true);

    // Валидация email
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      popupMessage.set(emailValidationError);
      return;
    }

    // Валидация пароля
    const passwordValidationError = validatePasswordFormat(password);
    if (passwordValidationError) {
      popupMessage.set(passwordValidationError);
      return;
    }

    try {
      const response = await fetch("/v1/api/sign-in", {  // Запрос на вход
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Обработка ошибки, если данные не прошли проверку
        if (response.status === 404) {
          popupMessage.set("Пользователь с таким никнеймом не найден.");
        } else if (response.status === 403) {
          popupMessage.set("Пользователь ещё не подтвердил почту.");
        } else if (data.detail) {
          popupMessage.set(data.detail);  // Отображаем сообщение об ошибке с сервера
        } else {
          popupMessage.set("Ошибка входа. Попробуйте еще раз.");
        }
      } else {
        // Успешный вход
        popupMessage.set("Вы успешно вошли!");
        setTimeout(() => {
          navigate("/"); // Перенаправление на главную страницу
        }, 1000);
      }
    } catch (err: any) {
      popupMessage.set(err.message || "Произошла ошибка при входе.");
    }

    setTimeout(() => showPopup.set(false), 3000);
  };

  // Валидация email при потере фокуса
  const validateOnBlur = () => {
    emailTouched.set(true); // Устанавливаем флаг, что поле было затронуто
    if (!email.trim()) {
      popupMessage.set(""); // Если поле пустое, убираем сообщение об ошибке
      showPopup.set(false); // Скрываем уведомление
      return;
    }

    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      popupMessage.set(emailValidationError);
      showPopup.set(true);
    } else {
      popupMessage.set(""); // Если ошибок нет
      showPopup.set(false);
    }
  };

  // Валидация пароля при потере фокуса
  const validatePasswordOnBlur = () => {
    passwordTouched.set(true); // Устанавливаем флаг, что поле было затронуто
    const passwordValidationError = validatePasswordFormat(password);
    if (passwordValidationError) {
      popupMessage.set(passwordValidationError);
      showPopup.set(true);
    } else {
      popupMessage.set("");
      showPopup.set(false);
    }
  };

  // Валидация email при вводе
  const handleEmailInput = () => {
    if (!email.trim()) {
      popupMessage.set(""); // Если поле пустое, убираем сообщение об ошибке
      showPopup.set(false); // Скрываем уведомление
      return;
    }

    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      popupMessage.set(emailValidationError);
      showPopup.set(true);
    } else {
      popupMessage.set("");
      showPopup.set(false);
    }
  };

  // Валидация пароля при вводе
  const handlePasswordInput = () => {
    if (!password.trim()) {
      popupMessage.set(""); // Если поле пустое, убираем сообщение об ошибке
      showPopup.set(false); // Скрываем уведомление
      return;
    }

    const passwordValidationError = validatePasswordFormat(password);
    if (passwordValidationError) {
      popupMessage.set(passwordValidationError);
      showPopup.set(true);
    } else {
      popupMessage.set("");
      showPopup.set(false);
    }
  };

  // Закрытие формы при клике вне неё
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
          <input 
            type="password" 
            id="password" 
            bind:value={password} 
            required 
            on:blur={validatePasswordOnBlur}
            on:input={handlePasswordInput}
          />
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
    background: rgba(26, 28, 29);
    color: rgba(255, 91, 91, 1);
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.2);
    font-weight: 600;
    text-align: center;
    margin-bottom: 1rem;
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
    color: rgb(0, 0, 0); /* Цвет текста на кнопке */
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background: rgba(150, 140, 130); /* Цвет кнопки при наведении */
  }
</style>
