<script lang="ts">
    import { goto } from "$app/navigation";
  </script>
  
  <style>
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #007bff;
      padding: 1rem 2rem;
      color: white;
    }
  
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      cursor: pointer;
    }
  
    .nav-links {
      display: flex;
      gap: 1rem;
    }
  
    .nav-links a {
      color: white;
      text-decoration: none;
      font-size: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      transition: background 0.3s;
    }
  
    .nav-links a:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  </style>
  
  <header class="header">
    <div class="logo" on:click={() => goto("/")}>🔥 MyApp</div>
    <nav class="nav-links">
      <a href="/login">Войти</a>
      <a href="/signup">Регистрация</a>
    </nav>
  </header>
  