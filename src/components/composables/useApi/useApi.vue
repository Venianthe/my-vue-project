<script setup lang="ts">
    import { useApi } from './useApi';
    import { computed } from 'vue';

    interface Post {
        id: number;
        name: string;
        mail: string;
        userId: number;
    }

    // Создаём composable для получения данных
    const { data, loading, error, success, execute } = useApi<Post[]>(
        { url: 'http://localhost:3000/posts', method: 'GET' },
        { immediate: true } // сразу загружаем
    );

    const lastPost = computed(() => {
        if (!data.value || data.value.length === 0) return null;
        return data.value[data.value.length - 1];
    });

    const nextUserId = computed(() => {
        if (!data.value) return 1;
        return data.value.length + 1;
    });

    // Функция для обновления данных (например, при нажатии кнопки)
    const refresh = () => {
        execute(); // повторный запрос с теми же параметрами
    };

    // Отправка POST-запроса
    const createPost = async () => {
        const result = await execute({
            method: 'POST',
            url: 'http://localhost:3000/posts',
            body: { name: 'Alex', mail: 'bar@yar.kor', userId: nextUserId.value },
        });
        if (result) {
            console.log('Создан пост:', result);
        }
    };
</script>

<template>
  <div class="post">
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">Ошибка: {{ error.message }}</div>
    <div v-else-if="success">
      <pre>{{ lastPost }}</pre>
    </div>
    <button @click="refresh">Обновить</button>
    <button @click="createPost">Создать</button>
  </div>
</template>