<script lang="ts">
	 import { writable, type Writable } from "svelte/store";
	import WantToExchangeForm from "E:/project/front/src/ui/forms/WantToExchangeForm.svelte";
	import ExchangeForm from "E:/project/front/src/ui/forms/ExchangeForm.svelte";
	import ReceiveForm from "E:/project/front/src/ui/forms/ReceiveForm.svelte"; // Импорт компонента ReceiveForm
  
	let showWantToExchangeForm: Writable<boolean> = writable(false);
	let showExchangeForm: Writable<boolean> = writable(false);
	let showReceiveForm: Writable<boolean> = writable(false);
  
	const closeWantToExchangeForm = () => showWantToExchangeForm.set(false);
	const closeExchangeForm = () => showExchangeForm.set(false);
	const closeReceiveForm = () => showReceiveForm.set(false);
  
	const openExchangeForm = () => {
	  showWantToExchangeForm.set(false);
	  showExchangeForm.set(true);
	  window.history.pushState({ form: "exchange" }, "Адрес доставки", "#exchange");
	};
	const openReceiveForm = () => {
	  showWantToExchangeForm.set(false);
	  showReceiveForm.set(true);
	  window.history.pushState({ form: "receive" }, "Получение книги", "#receive");
	};
  
	window.addEventListener("popstate", () => {
	  const state = window.history.state;
	  if (state && state.form === "exchange") {
		showWantToExchangeForm.set(false);
		showExchangeForm.set(true);
		showReceiveForm.set(false);
	  } else if (state?.form === "receive") {
		showWantToExchangeForm.set(true);
		showExchangeForm.set(false);
		showReceiveForm.set(false);
	  } else {
		showWantToExchangeForm.set(false);
		showExchangeForm.set(false);
		showReceiveForm.set(true);
	  }
	});
  </script>
  
  
<main class="container">
	<nav class="menu">
	  <a href="/" class="menu-item">Главная</a>
	  <button 
		class="menu-item" 
		on:click={() => showWantToExchangeForm.set(true)} 
		aria-label="Открыть форму обмена">
		Хочу обменять
	  </button>
	  <a href="/my-exchanges" class="menu-item">Мои обмены</a>
	
	</nav>
  
	<section class="content">
	  <p>Описание приложения, правила обмена, чем интересно - "сюрприз"...</p>
	</section>
  
	{#if $showWantToExchangeForm}
  <div class="overlay" on:click={closeWantToExchangeForm}></div>
  <WantToExchangeForm
    {showWantToExchangeForm}
    close={closeWantToExchangeForm}
    openExchangeForm={openExchangeForm}
    openReceiveForm={openReceiveForm}
  />
{/if}

{#if $showExchangeForm}
  <div class="overlay" on:click={closeExchangeForm}></div>
  <ExchangeForm {showExchangeForm} close={closeExchangeForm} />
{/if}

{#if $showReceiveForm}
  <div class="overlay" on:click={closeReceiveForm}></div>
  <ReceiveForm {showReceiveForm} close={closeReceiveForm} />
{/if}
</main>
  
<style>
	.container {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  padding: 20px;
	}
  
	.menu {
	  display: flex;
	  gap: 10px;
	  margin-bottom: 20px;
	}
  
	.menu-item {
	  padding: 10px 15px;
	  background: rgb(42, 45, 47);
	  border-radius: 8px;
	  text-decoration: none;
	  color: rgba(173, 166, 156, 1);
	  border: none;
	  cursor: pointer;
	}
  
	.menu-item:hover {
	  background: rgb(50, 53, 55);
	}
  
	.content {
	  background: rgb(42, 45, 47);
	  color: rgba(173, 166, 156, 1);
	  padding: 20px;
	  border-radius: 10px;
	  max-width: 800px;
	  width: 100%;
	  text-align: center;
	}
  
	.overlay {
	  position: fixed;
	  top: 0;
	  left: 0;
	  width: 100vw;
	  height: 100vh;
	  background: rgba(0, 0, 0, 0.6);
	  z-index: 5;
	}
  
	/* Стили для формы WantToExchangeForm */
	.want-to-exchange-container {
	  display: flex;
	  flex-direction: row;
	  gap: 20px;
	  background: rgb(42, 45, 47);
	  border-radius: 10px;
	  padding: 20px;
	  max-width: 1000px;
	  margin: auto;
	}
  
	.left-block, .right-block {
	  display: flex;
	  flex-direction: column;
	  gap: 10px;
	  width: 48%;
	}
  
	.input-field {
	  padding: 10px;
	  border-radius: 8px;
	  border: 1px solid #ccc;
	  background: rgba(173, 166, 156, 0.2);
	  color: #fff;
	}
  
	/* Для формы адреса доставки (ExchangeForm) */
	.exchange-form-container {
	  display: flex;
	  flex-direction: row;
	  gap: 20px;
	  background: rgb(42, 45, 47);
	  border-radius: 10px;
	  padding: 20px;
	  max-width: 1000px;
	  margin: auto;
	}
  
	.address-left, .address-right {
	  display: flex;
	  flex-direction: column;
	  gap: 10px;
	  width: 48%;
	}
  
	.address-input-field {
	  padding: 10px;
	  border-radius: 8px;
	  border: 1px solid #ccc;
	  background: rgba(173, 166, 156, 0.2);
	  color: #fff;
	}
  
	.checkbox-container {
	  margin-top: 15px;
	  display: flex;
	  align-items: center;
	}
  
	.checkbox-container input {
	  margin-right: 10px;
	}
</style>
