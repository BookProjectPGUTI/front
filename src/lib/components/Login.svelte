<script lang="ts">
  import { writable } from "svelte/store";
  import { navigate } from 'svelte-routing';

  export let isOpen = writable(false);
  let password: string = "";
  let nickname: string = "";
  let error = writable<string>("");

  let showPopup = writable<boolean>(false);
  let popupMessage = writable<string>("");

  // Валидация пароля
  const validatePasswordFormat = (password: string): string => {
    if (!password.trim()) return "";
    if (/[а-яА-ЯёЁ]/.test(password)) return "Пароль не должен содержать кириллицу.";
    if (password.length < 8) return "Пароль должен содержать минимум 8 символов.";
    if (!/[A-Z]/.test(password)) return "Пароль должен содержать хотя бы одну заглавную букву.";
    if (!/[0-9]/.test(password)) return "Пароль должен содержать хотя бы одну цифру.";
    return "";
  };

  // Валидация ника
 const validateNickname = (nickname: string): string => {
  const nicknameRegex = /^[a-zA-Zа-яА-ЯёЁ0-9]+$/; // Добавлены цифры
  if (!nickname.trim()) return 'Ник не может быть пустым.';
  if (!nicknameRegex.test(nickname)) return 'Ник должен содержать только буквы латиницы, кириллицы и цифры.';
  if (nickname.length < 3) return 'Ник должен содержать минимум 3 символа.';
  return '';
};

  // Проверка уникальности ника
  const checkNicknameUniqueness = async (nickname: string): Promise<boolean> => {
    try {
      const response = await fetch(`/v1/api/check-nickname?nickname=${nickname}`);
      const data = await response.json();
      return data.isUnique;
    } catch (err) {
      return false;
    }
  };

  // Обработчик формы
  const handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    popupMessage.set("");
    showPopup.set(true);

    // Валидация пароля
    const passwordValidationError = validatePasswordFormat(password);
    if (passwordValidationError) {
      popupMessage.set(passwordValidationError);
      return;
    }

    // Валидация ника
    const nicknameValidationError = validateNickname(nickname);
    if (nicknameValidationError) {
      popupMessage.set(nicknameValidationError);
      return;
    }

    // Проверка уникальности ника
    const isNicknameUnique = await checkNicknameUniqueness(nickname);
    if (!isNicknameUnique) {
      popupMessage.set('Неверные данные для входа ');
      return;
    }

    try {
      const response = await fetch("/v1/api/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, nickname }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          popupMessage.set("Пользователь заблокирован или не подтвержден.");
        } else if (data.detail) {
          popupMessage.set(data.detail);
        } else {
          popupMessage.set("Неверные данные для входа ");
        }
      } else {
        popupMessage.set("Вы успешно вошли!");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err: any) {
      popupMessage.set(err.message || "Произошла ошибка при входе.");
    }

    setTimeout(() => showPopup.set(false), 3000);
  };

  // Валидация ника при вводе
  const handleNicknameInput = async () => {
    const nicknameValidationError = validateNickname(nickname);
    if (nicknameValidationError) {
      popupMessage.set(nicknameValidationError);
      showPopup.set(true);
      return;
    }

    const isNicknameUnique = await checkNicknameUniqueness(nickname);
    if (!isNicknameUnique) {
      popupMessage.set('Неверные данные для входа ');
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

  // Перенаправление на страницу восстановления пароля
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };
</script>

{#if $isOpen}
  <div class="modal" on:click={handleOutsideClick}>
    <div class="form-wrapper">
      <h2>Вход</h2>

      {#if $showPopup}
        <div class="popup show">{$popupMessage}</div>
      {/if}

      <form on:submit={handleSubmit}>
        <div class="form-group">
          <label for="nickname">Ник:</label>
          <input 
            type="text" 
            id="nickname" 
            bind:value={nickname} 
            required 
            on:input={handleNicknameInput}
          />
        </div>
        <div class="form-group">
          <label for="password">Пароль:</label>
          <input 
            type="password" 
            id="password" 
            bind:value={password} 
            required 
          />
        </div>

        <button class="button" type="submit">Войти</button>
      </form>

      <div class="forgot-password">
        <a href="javascript:void(0)" on:click={handleForgotPassword}>Забыли пароль?</a>
      </div>
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
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .form-wrapper {
    background: rgb(255, 255, 255);
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    color:#333;
    z-index: 1100;
  }

  h2 {
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .popup {
    background: rgb(255, 255, 255);
    color: rgba(255, 91, 91, 1);
    padding: 12px 20px;
    border-radius: 6px;
    
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
    border: 1px solid rgb(243, 243, 243);
    border-radius: 5px;
    background-color: rgba(27, 30, 31, 0.1);
    color: #333;
    box-sizing: border-box;
  }

  .button {
    width: 100%;
    padding: 0.7rem;
    border: none;
    background:  #00aaff;
    color: rgb(255, 255, 255);
    font-size: 1rem;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease;
  }

  .button:hover {
    background: #00aaff;
    transform: scale(1.05);
  }

  .button:active {
    transform: scale(0.98);
  }

  .forgot-password {
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  .forgot-password a {
    color:  #00aaff;
    text-decoration: none;
  }

  .forgot-password a:hover {
    text-decoration: underline;
  }
</style>
