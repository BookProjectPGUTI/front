<script lang="ts">
     import { writable, type Writable } from "svelte/store";
  
     export let showReceiveForm: Writable<boolean>; // 
        export let close: () => void;
  
    let genres: string[] = [];
    let selectedGenres: string[] = [];
  
    // Загружаем жанры через API
    async function fetchGenres() {
      try {
        const res = await fetch('v1/genres');
        const data = await res.json();
        genres = data;
      } catch (error) {
        alert('Не удалось получить список жанров');
      }
    }
  
    fetchGenres();
  </script>
  
  <div class="form-container">
    <h2>Выберите жанры</h2>
    <button class="close-btn" on:click={close}>×</button>
    <div class="form-content">
      <div class="genre-list">
        {#each genres as genre}
          <label>
            <input type="checkbox" bind:group={selectedGenres} value={genre} />
            {genre}
          </label>
        {/each}
      </div>
    </div>
  
   
    
  </div>
  
  <style>
    .form-container {
      background: rgb(42, 45, 47);
      color: rgba(173, 166, 156, 1);
      padding: 20px;
      border-radius: 10px;
      width: 700px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      gap: 15px;
      z-index: 10;
    }
  
    .form-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  
    .genre-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  
    .next-btn {
      padding: 10px;
      background: rgb(42, 45, 47);
      border-radius: 8px;
      color: rgba(173, 166, 156, 1);
      border: none;
      cursor: pointer;
    }
  
    .close-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 24px;
      color: rgba(173, 166, 156, 1);
      cursor: pointer;
    }
  </style>
  