<script lang="ts">
  import { writable } from "svelte/store";
  import { fetchWithRefresh } from '$lib/auth';
  import { userStore, API_BASE_URL } from '$lib/stores'; 

  let email: string = "";
  let username: string = "";
  let password: string = "";
  let error = writable<string>("");
  let emailError = writable<string>("");
  let usernameError = writable<string>("");
  let passwordError = writable<string>("");
  let showPopup = writable<boolean>(false);
  let successMessage = writable<string>("");

  const validateEmailFormat = (email: string): string => {
    if (!email.trim()) return 'Поле email не может быть пустым.';
    const invalidCharsRegex = /[^a-zA-Z0-9._@-]/;
    if (invalidCharsRegex.test(email)) {
      return 'Почта должна содержать только английские символы, цифры, точки, дефисы и подчеркивания.';
    }
    if (!email.includes('@')) return 'Отсутствует символ @.';
    const [localPart, domainPart] = email.split('@');
    if (!localPart) return 'Локальная часть адреса не может быть пустой.';
    if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.startsWith('-') || localPart.endsWith('-')) {
      return 'Локальная часть не может начинаться или заканчиваться на точку или дефис.';
    }
    if (!domainPart) return 'Отсутствует доменная часть в почтовом адресе.';
    if (domainPart.startsWith('.') || domainPart.endsWith('.') || domainPart.startsWith('-') || domainPart.endsWith('-')) {
      return 'Доменная часть не может начинаться или заканчиваться на точку или дефис.';
    }
    if (!domainPart.includes('.')) return 'Доменная часть должна содержать хотя бы одну точку.';
    if (domainPart.includes('..')) return 'Доменная часть не может содержать две точки подряд.';
    return '';
  };

  const validateUsername = (username: string): string => {
    if (!username.trim()) return 'Никнейм не может быть пустым.';
    if (username.length < 3) return 'Никнейм должен содержать минимум 3 символа.';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password.trim()) return 'Пароль не может быть пустым.';
    if (/[а-яА-ЯёЁ]/.test(password)) return "Пароль не должен содержать кириллицу.";
    if (password.length < 8) return "Пароль должен содержать минимум 8 символов.";
    if (!/[A-Z]/.test(password)) return "Пароль должен содержать хотя бы одну заглавную букву.";
    if (!/[0-9]/.test(password)) return "Пароль должен содержать хотя бы одну цифру.";
    return '';
  };

  const handleEmailInput = () => {
    const validationError = validateEmailFormat(email);
    emailError.set(validationError);
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

    const emailValidationError = validateEmailFormat(email);
    emailError.set(emailValidationError);

    const usernameValidationError = validateUsername(username);
    usernameError.set(usernameValidationError);

    const passwordValidationError = validatePassword(password);
    passwordError.set(passwordValidationError);

    if (emailValidationError || usernameValidationError || passwordValidationError) {
      return;
    }

    const payload = { email, username, password };

    try {
      const response = await fetchWithRefresh(`${API_BASE_URL}/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.detail === "Username already exists") {
          usernameError.set("Такой никнейм уже существует.");
        } else if (data.detail === "Email already exists") {
          emailError.set("Такая почта уже зарегистрирована.");
        } else {
          throw new Error(data.detail || "Ошибка регистрации.");
        }
        showPopup.set(true);
        return;
      }

      error.set("");
      const data = await response.json();
      successMessage.set("Сообщение с подтверждением отправлено на вашу почту. Пожалуйста, проверьте вашу почту и подтвердите регистрацию.");
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
    background-color: rgba(255, 255, 255, 0.9);
  }

  .form-wrapper {
    background: rgb(255, 255, 255);
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    color: #333;
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

  .success {
    background: rgba(26, 28, 29);
    color: rgba(0, 255, 0, 1);
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.2);
    font-weight: 600;
    text-align: center;
    margin-bottom: 1rem;
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

  button {
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

button:active {
    transform: scale(0.98); /* Небольшое сжатие при нажатии */
}

</style>

<div class="container">
  <div class="form-wrapper">
    <h2>Регистрация</h2>
    {#if $error}
      <div class="error-message show">{$error}</div>
    {/if}
    {#if $successMessage}
      <div class="success-message">{$successMessage}</div>
    {/if}
    <form on:submit={handleSubmit} novalidate>
      <div class="form-group">
        <label for="email">Почта:</label>
        <input type="text" id="email" bind:value={email} required on:input={handleEmailInput} />
        {#if $emailError}
          <div class="error-message show">{$emailError}</div>
        {/if}
      </div>
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
      <button type="submit">Зарегистрироваться</button>
    </form>
  </div>
</div>