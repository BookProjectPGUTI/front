<script lang="ts">
  import { writable } from "svelte/store";
  import { fetchWithRefresh, getTokenExpiration, scheduleTokenRefresh } from '$lib/auth';
  import { goto } from '$app/navigation';
  import { userStore, API_BASE_URL } from '$lib/stores'; 

  export let isOpen = writable(false);

  let username: string = "";
  let password: string = "";
  let error = writable<string>("");
  let showPopup = writable<boolean>(false);
  let usernameError = writable<string>("");
  let passwordError = writable<string>("");
  let successMessage = writable<string>("");

  $: if ($isOpen) {
    successMessage.set("");
    error.set("");
  }

  const validateUsername = (username: string): string => {
    if (!username.trim()) return 'Поле Никнейм не может быть пустым.';
    return ''; 
  };

  const validatePassword = (password: string): string => {
    if (!password.trim()) return 'Пароль не может быть пустым.';
    return ''; 
  };

  const handleUsernameInput = () => {
    const validationError = validateUsername(username);
    usernameError.set(validationError);
  };

  const handlePasswordInput = () => {
    const validationError = validatePassword(password);
    passwordError.set(validationError);
  };

  const handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();

    const usernameValidationError = validateUsername(username);
    const passwordValidationError = validatePassword(password);
    usernameError.set(usernameValidationError);
    passwordError.set(passwordValidationError);

    if (usernameValidationError || passwordValidationError) {
      return;
    }
    try {
      const response = await fetchWithRefresh(`${API_BASE_URL}/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", 
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Ошибка сервера: получен некорректный ответ.");
      }

      const data = await response.json();

      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new Error(data.details || "Неверные данные для входа.");
          case 403:
            throw new Error(data.details || "Почта пользователя не подтверждена.");
          case 404:
            throw new Error(data.details || "Пользователь не найден.");
          case 422:
            const validationErrors = data.detail.map((err: any) => err.msg).join(", ");
            throw new Error(`Ошибка валидации: ${validationErrors}`);
          default:
            throw new Error("Ошибка входа");
        }
      }
      successMessage.set("");
      error.set("");
      successMessage.set("Вы успешно вошли!");
      showPopup.set(true);
      userStore.set(data); 
      try {
        const userResponse = await fetchWithRefresh(`${API_BASE_URL}/users/me`, {
          method: "GET",
          credentials: "include",
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          userStore.set(userData); 
        } else {
          userStore.set(null); 
        }
      } catch (err) {
        console.error("Ошибка при проверке авторизации:", err);
        userStore.set(null);
      }
      setTimeout(() => {
        isOpen.set(false);
      }, 1000);
      goto('/');


    } catch (err: any) {
      error.set(err.message);
      showPopup.set(true);
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    const modal = document.querySelector(".form-wrapper");
    if (modal && !modal.contains(event.target as Node)) {
      isOpen.set(false);
    }
  };
</script>

{#if $isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal" on:click={handleOutsideClick}>
    <div class="form-wrapper">
      <h2>Вход</h2>
      {#if $error}
        <div class="centralerror show">{$error}</div>
      {/if}
      {#if $successMessage}
        <div class="success-message">{$successMessage}</div>
      {/if}
      <form on:submit={handleSubmit} novalidate>
        <div class="form-group">
          <label for="username">Никнейм:</label>
          <input type="text" id="username" bind:value={username} required on:input={handleUsernameInput} />
          {#if $usernameError}
            <div class="error-message show">
              {$usernameError}
            </div>
          {/if}
        </div>
        <div class="form-group">
          <label for="password">Пароль:</label>
          <input type="password" id="password" bind:value={password} required on:input={handlePasswordInput} />
          {#if $passwordError}
            <div class="error-message show">
              {$passwordError}
            </div>
          {/if}
        </div>
        <button class="button"type="submit">Войти</button>
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
</style>