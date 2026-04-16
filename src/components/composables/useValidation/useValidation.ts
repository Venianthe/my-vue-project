import { ref, computed, type Ref, type ComputedRef } from 'vue';

/**
 * Тип правила валидации.
 * Возвращает true, если валидация пройдена, или строку с сообщением об ошибке.
 */
export type ValidationRule = (value: any, allValues?: Record<string, any>) => true | string;

/**
 * Правила для полей: ключ – имя поля, значение – массив правил.
 */
export type ValidationRules<T = Record<string, any>> = Partial<Record<keyof T, ValidationRule[]>>;

/**
 * Интерфейс возвращаемого объекта useValidation.
 */
interface UseValidationReturn<T extends Record<string, any>> {
  values: Ref<T>;
  errors: ComputedRef<Partial<Record<keyof T, string | null>>>;
  isValid: ComputedRef<boolean>;
  validate: () => boolean;
  validateField: (fieldName: keyof T) => boolean;
  setFieldValue: (fieldName: keyof T, value: any) => void;
}

/**
 * Универсальный composable для валидации форм.
 */
export function useValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: ValidationRules<T> = {}
): UseValidationReturn<T> {
  const values = ref<T>({ ...initialValues }) as Ref<T>;

  const errors = computed(() => {
    const result: Partial<Record<keyof T, string | null>> = {};

    for (const fieldName of Object.keys(values.value) as (keyof T)[]) {
      const fieldRules = rules[fieldName] || [];
      const fieldValue = values.value[fieldName];
      let errorMessage: string | null = null;

      for (const rule of fieldRules) {
        const validationResult = rule(fieldValue, values.value);
        if (validationResult !== true) {
          errorMessage = validationResult;
          break;
        }
      }
      result[fieldName] = errorMessage;
    }

    return result;
  });

  const isValid = computed(() => {
    return Object.values(errors.value).every((err) => err === null);
  });

  const validate = (): boolean => {
    // Принудительно вызываем пересчет computed
    const currentErrors = errors.value;
    return Object.values(currentErrors).every((err) => err === null);
  };

  const validateField = (fieldName: keyof T): boolean => {
    const fieldRules = rules[fieldName] || [];
    const fieldValue = values.value[fieldName];
    
    for (const rule of fieldRules) {
      const validationResult = rule(fieldValue, values.value);
      if (validationResult !== true) {
        return false;
      }
    }
    
    return true;
  };

  const setFieldValue = (fieldName: keyof T, value: any) => {
    values.value[fieldName] = value;
  };

  return {
    values,
    errors,
    isValid,
    validate,
    validateField,
    setFieldValue,
  };
}