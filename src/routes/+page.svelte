<script lang="ts">
	import { writable } from "svelte/store";
	import { type Writable } from "svelte/store";
	import WantToExchangeForm from "../lib/ui/forms/WantToExchangeForm.svelte";
	import ExchangeForm from "../lib/ui/forms/ExchangeForm.svelte";
	import ReceiveForm from "$lib/ui/forms/ReceiveForm.svelte"; // Импортируем ReceiveForm
	export let bookData: { [key: string]: string } | null;
	// Состояние текущей формы
	let currentForm: Writable<string> = writable(''); // Пустая строка означает отсутствие формы
	
	
  
	// Функция для закрытия формы
	const closeForm = () => {
	  currentForm.set(''); // Закрываем текущую форму
	  window.history.pushState({}, '', window.location.pathname); // Сбрасываем URL
	  console.log("Form closed, URL reset");
	};
  
	// Функции для переключения форм
	const openExchangeForm = () => {
		closeForm();
		console.log('Current form before openWantToExchangeForm:', $currentForm);
	  currentForm.set('exchange');
	  window.history.pushState({ form: "exchange" }, "Адрес доставки", "#exchange");
	  console.log("Opened Exchange Form");
	};
  
	const openReceiveForm = () => {
		closeForm();
		console.log('Current form before openWantToExchangeForm:', $currentForm);
	  currentForm.set('receive');
	  window.history.pushState({ form: "receive" }, "Получение книги", "#receive");
	  console.log("Opened Receive Form");
	};
  
	const openWantToExchangeForm = () => {
		closeForm();
		console.log('Current form before openWantToExchangeForm:', $currentForm);
	  currentForm.set('wanttoexchange');
	  window.history.pushState({ form: "wanttoexchange" }, "Хочу обменять", "#wanttoexchange");
	  console.log("Opened WantToExchange Form");
	};
  
	// Слушатель для popstate, чтобы синхронизировать URL с состоянием
	window.addEventListener("popstate", () => {
	  const state = window.history.state;
	  if (state?.form === "exchange") {
		currentForm.set('exchange');
	  } else if (state?.form === "wanttoexchange") {
		currentForm.set('wanttoexchange');
	  } else if (state?.form === "receive") {
		currentForm.set('receive');
	  } else {
		currentForm.set(''); // Если форма не найдена, скрываем все
	  }
	  console.log("Popstate triggered: ", state?.form);
	});
  </script>
  
  <main class="container">
	<nav class="menu">
	  <a href="/" class="menu-item">Главная</a>
	  <button 
		class="menu-item" 
		on:click={() => openWantToExchangeForm()} 
		aria-label="Открыть форму обмена">
		Хочу обменять
	  </button>
	  <a href="/my-exchanges" class="menu-item">Мои обмены</a>
	</nav>
  
	<section class="content">
	  <p>Описание приложения, правила обмена, чем интересно - "сюрприз"...</p>
	</section>
  
	<!-- Показываем форму WantToExchangeForm, если состояние currentForm равно 'wanttoexchange' -->
	{#if $currentForm === 'wanttoexchange'}
	  <WantToExchangeForm
		close={closeForm} 
		openExchangeForm={openExchangeForm}
		openReceiveForm={openReceiveForm}
		showWantToExchangeForm={true}
	  />
	{/if}
  
	<!-- Показываем форму ExchangeForm, если состояние currentForm равно 'exchange' -->
	{#if $currentForm === 'exchange'}
	  <ExchangeForm close={closeForm} bookData={bookData} />
	  
	{/if}
  
	<!-- Показываем форму ReceiveForm, если состояние currentForm равно 'receive' -->
	{#if $currentForm === 'receive'}
  <ReceiveForm close={closeForm} bookData={bookData} />
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
  </style>
  