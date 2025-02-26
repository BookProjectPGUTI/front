<script>
  export let errorStatus;
</script>

<style>
  .error-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f7f7f7;
    font-family: Arial, sans-serif;
  }

  .error-content {
    text-align: center;
    font-size: 80px;
    font-weight: bold;
    color: #ff4c4c;
  }

  .error-content h1 {
    font-size: 120px;
    margin-bottom: 20px;
  }

  .error-content p {
    font-size: 24px;
    color: #555;
  }

  .error-content a {
    color: #007BFF;
    text-decoration: none;
    font-size: 20px;
    margin-top: 20px;
    display: inline-block;
  }

  .error-content a:hover {
    text-decoration: underline;
  }
</style>

<div class="error-page">
  <div class="error-content">
    <h1>{errorStatus}</h1>
    <p>Что-то пошло не так. Пожалуйста, попробуйте снова.</p>
    <p><a href="/">Вернуться на главную</a></p>
  </div>
</div>
