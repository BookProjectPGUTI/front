<script lang="ts">
  import { writable } from "svelte/store";
  
  let email: string = "";
  let username: string = "";
  let password: string = "";
  let error = writable<string>("");

  // Валидация почты
  const validateEmail = (email: string): boolean => {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  };

  const handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    error.set("");

    if (!validateEmail(email)) {
      error.set("Некорректный формат почты");
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

      if (!response.ok) {
        throw new Error(data.detail || "Ошибка регистрации");
      }

      alert("Регистрация прошла успешно. Подтвердите почту");
      // navigate("/login"); // Замените на вашу навигацию
    } catch (err: any) {
      error.set(err.message);
    }
  };
</script>

<style>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f4f4f4;
  }

  .form-wrapper {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }

  h2 {
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
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .error {
    color: red;
    font-size: 0.9rem;
    text-align: center;
  }

  button {
    width: 100%;
    padding: 0.7rem;
    border: none;
    background: #007bff;
    color: white;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background: #0056b3;
  }
</style>

<div class="container">
  <div class="form-wrapper">
    <h2>Регистрация</h2>
    <form on:submit={handleSubmit}>
      <div class="form-group">
        <label for="email">Почта:</label>
        <input type="email" id="email" bind:value={email} required />
      </div>
      <div class="form-group">
        <label for="username">Никнейм:</label>
        <input type="text" id="username" bind:value={username} required />
      </div>
      <div class="form-group">
        <label for="password">Пароль:</label>
        <input type="password" id="password" bind:value={password} required />
      </div>
      {#if $error}
        <p class="error">{$error}</p>
      {/if}
      <button type="submit">Зарегистрироваться</button>
    </form>
  </div>
</div>
