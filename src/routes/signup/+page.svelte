<script lang="ts">
  import { writable } from "svelte/store";

  let email: string = "";
  let username: string = "";
  let password: string = "";
  let emailError = writable<string>("");
  let passwordError = writable<string>("");
  let usernameError = writable<string>("");
  let showPopup = writable<boolean>(false);
  let successMessage = writable<string>("");

  // Функция валидации email
  const validateEmailFormat = (email: string): string => {
    const invalidCharsRegex = /[^a-zA-Z0-9._@-]/;
    if (!email.trim()) return ""; 
    if (invalidCharsRegex.test(email)) {
      return "Почта должна содержать только английские символы, цифры, точки, дефисы и подчеркивания.";
    }
    if (!email.includes("@")) return "Отсутствует символ @.";
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const [localPart, domainPart] = email.split("@");
    if (!domainPart || !domainRegex.test(domainPart)) return "Некорректный формат домена (пример: example.com).";
    return "";
  };

  // Функция валидации пароля
  const validatePasswordFormat = (password: string): string => {
    if (!password.trim()) return ""; 
    if (/[а-яА-ЯёЁ]/.test(password)) return "Пароль не должен содержать кириллицу.";
    if (password.length < 8) return "Пароль должен содержать минимум 8 символов.";
    if (!/[A-Z]/.test(password)) return "Пароль должен содержать хотя бы одну заглавную букву.";
    if (!/[0-9]/.test(password)) return "Пароль должен содержать хотя бы одну цифру.";
    return "";
  };

  const validateEmail = () => {
    emailError.set(validateEmailFormat(email));
  };

  const validatePassword = () => {
    passwordError.set(validatePasswordFormat(password));
  };

  const validateUsername = () => {
    if (!username.trim()) {
      usernameError.set("Никнейм не может быть пустым.");
    } else {
      usernameError.set("");
    }
  };

  const handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    emailError.set("");
    passwordError.set("");
    usernameError.set("");
    showPopup.set(false);
    successMessage.set("");

    validateEmail();
    validatePassword();
    validateUsername();

    if ($emailError || $passwordError || $usernameError) return;

    const payload = { email, username, password };

    try {
      const response = await fetch("/v1/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Проверяем, является ли ответ JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Ошибка сервера: получен некорректный ответ.");
      }

      const data = await response.json();
      if (!response.ok) {
        if (data.detail === "Username already exists") {
          usernameError.set("Такой никнейм уже существует.");
        } else {
          throw new Error(data.detail || "Ошибка регистрации.");
        }
        showPopup.set(true);
        return;
      }

      successMessage.set("Сообщение с подтверждением отправлено на вашу почту!");
    } catch (err: any) {
      emailError.set(err.message);
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
    margin-bottom: 0.5rem;
  }

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
    border: 1px solid rgba(18,18,18);
    border-radius: 5px;
    background-color: rgba(27, 30, 31);
    color: rgba(173, 166, 156, 1);
    box-sizing: border-box;
  }

  button {
    width: 100%;
    padding: 0.7rem;
    border: none;
    background: #007bff;
    color: black;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    box-sizing: border-box;
  }

  button:hover {
   background:  rgba(150, 140, 130);
  }
</style>

<div class="container">
  <div class="form-wrapper">
    <h2>Регистрация</h2>

    {#if $emailError || $passwordError}
      <div class="popup show">{$emailError || $passwordError}</div>
    {/if}

    {#if $successMessage}
      <div class="success">{$successMessage}</div>
    {/if}

    <form on:submit={handleSubmit}>
      <div class="form-group">
        <label for="email">Почта:</label>
        <input type="email" id="email" bind:value={email} required on:blur={validateEmail} on:input={validateEmail} />
      </div>
      <div class="form-group">
        <label for="username">Никнейм:</label>
        <input type="text" id="username" bind:value={username} required />
      </div>
      <div class="form-group">
        <label for="password">Пароль:</label>
        <input type="password" id="password" bind:value={password} required on:blur={validatePassword} on:input={validatePassword} />
      </div>
      <button type="submit">Зарегистрироваться</button>
    </form>
  </div>
</div>
