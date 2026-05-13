<script setup lang="ts">
    import { useValidation } from './useValidation';

    // Примеры правил
    const required = (value: any) => !!value || 'Поле обязательно';
    const minLength = (min: number) => (value: string) =>
    value.length >= min || `Минимальная длина ${min} символов`;
    const email = (value: string) =>
    /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(value) || 'Некорректный email';

    const { values, errors, isValid, validate } = useValidation(
        { name: '', email: '' },
        {
            name: [required, minLength(3)],
            email: [required, email],
        }
    );

    const handleSubmit = () => {
        if (validate()) {
            console.log('Форма валидна', values.value);
        } else {
            console.log('Ошибки валидации', errors.value);
        }
    };
</script>

<template>
  <form @submit.prevent="handleSubmit" class="submitForm">
    <div>
      <label>Имя:</label>
      <input v-model="values.name" />
      <div v-if="errors.name">{{ errors.name }}</div>
    </div>
    <div>
      <label>Email:</label>
      <input v-model="values.email" />
      <div v-if="errors.email">{{ errors.email }}</div>
    </div>
    <button type="submit" :disabled="!isValid">Отправить</button>
  </form>
</template>