<script setup lang="ts">
    import { useApi } from './useApi';

    // Создаём composable для получения данных
    const { data, loading, error, success, execute } = useApi<{ id: number; title: string }>(
        { url: 'https://jsonplaceholder.typicode.com/posts/1', method: 'GET' },
        { immediate: true } // сразу загружаем
    );

    // Функция для обновления данных (например, при нажатии кнопки)
    const refresh = () => {
        execute(); // повторный запрос с теми же параметрами
    };

    // Отправка POST-запроса
    const createPost = async () => {
    const result = await execute({
        method: 'POST',
        url: 'https://jsonplaceholder.typicode.com/posts',
        body: { title: 'foo', body: 'bar', userId: 1 },
    });
    if (result) {
        console.log('Создан пост:', result);
    }
    };
</script>

<template>
  <div>
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">Ошибка: {{ error.message }}</div>
    <div v-else-if="success">
      <pre>{{ data }}</pre>
    </div>
    <button @click="refresh">Обновить</button>
    <button @click="createPost">Создать пост</button>
  </div>
</template>