<script lang="ts">
  import { writable } from "svelte/store";

  export let isOpen = writable(false);
  let username: string = "";
  let password: string = "";
  let error = writable<string>("");
  let showPopup = writable<boolean>(false);
  let popupMessage = writable<string>("");
  let usernameError = writable<string>("");
  let passwordError = writable<string>("");

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
      popupMessage.set("Пожалуйста, исправьте ошибки в форме.");
      showPopup.set(true);
      return;
    }

    try {
      const response = await fetch("/v1/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Ошибка сервера: получен некорректный ответ.");
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Ошибка входа");
      }

      popupMessage.set("Вы успешно вошли!");
      showPopup.set(true);
    } catch (err: any) {
      popupMessage.set(err.message);
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
      {#if $showPopup}
        <div class="popup show">{$popupMessage}</div>
      {/if}
      <form on:submit={handleSubmit} novalidate>
        <div class="form-group">
          <label for="username">Никнейм:</label>
          <input type="text" id="username" bind:value={username} required on:input={handleUsernameInput} />
          {#if $usernameError}
            <div class="error-message show">{$usernameError}</div>
          {/if}
        </div>
        <div class="form-group">
          <label for="password">Пароль:</label>
          <input type="password" id="password" bind:value={password} required on:input={handlePasswordInput} />
          {#if $passwordError}
            <div class="error-message show">{$passwordError}</div>
          {/if}
        </div>
        <button type="submit">Войти</button>
      </form>
    </div>
  </div>
{/if}

<style>
  .error-message {
    color: #ff6b6b;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    text-align: left;
  }

  .error-message.show {
    opacity: 1;
    transform: translateY(0);
  }

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
    z-index: 1000;
  }

  .form-wrapper {
    background: rgba(27, 30, 31);
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
    position: relative;
    color: rgba(173, 166, 156);
  }

  h2 {
    margin-bottom: 0.5rem;
  }

  .popup {
    background: rgba(26, 28, 29);
    color: rgba(173, 166, 156);
    padding: 10px 20px;
    border-radius: 6px;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
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
    border: 1px solid rgba(18, 18, 18);
    border-radius: 5px;
    background: rgba(24, 26, 27);
    color: rgba(173, 166, 156);
  }

  button {
    width: 100%;
    padding: 0.7rem;
    border: none;
    background: #007bff;
    color: rgba(18, 18, 18);
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background: rgba(150, 140, 130);
  }
</style>
