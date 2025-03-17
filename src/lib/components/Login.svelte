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
    const nicknameRegex = /^[a-zA-Zа-яА-ЯёЁ]+$/;
    if (!nickname.trim()) return 'Ник не может быть пустым.';
    if (!nicknameRegex.test(nickname)) return 'Ник должен содержать только буквы латиницы и кириллицы.';
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
      popupMessage.set('Этот ник уже занят. Пожалуйста, выберите другой.');
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
          popupMessage.set("Ошибка входа. Попробуйте еще раз.");
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
      popupMessage.set('Этот ник уже занят. Пожалуйста, выберите другой.');
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

        <button type="submit">Войти</button>
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
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .form-wrapper {
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
    text-align: center;
  }

  .popup {
    color: red;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .popup.show {
    display: block;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.3rem;
    font-size: 1rem;
  }

  input {
    width: 100%;
    padding: 0.6rem;
    font-size: 1rem;
    margin-bottom: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  button {
    width: 100%;
    padding: 0.7rem;
    border: none;
    background: rgb(232, 121, 62); 
    color: rgb(0, 0, 0); 
    font-size: 1rem;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.2s ease; 
    
}
button:hover {
    background: rgb(232, 121, 62); 
    transform: scale(1.05); /* Легкое увеличение */
}

button:active {
    transform: scale(0.98); /* Небольшое сжатие при нажатии */
}

  .forgot-password {
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  .forgot-password a {
    color: #ff9800;
    text-decoration: none;
  }

  .forgot-password a:hover {
    text-decoration: underline;
  }
</style>
