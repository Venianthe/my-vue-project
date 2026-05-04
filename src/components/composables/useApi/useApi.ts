// composables/useApi.ts
import { ref, type Ref } from 'vue';

/**
 * Конфигурация запроса.
 */
export interface RequestConfig {
  /** URL запроса (обязательный) */
  url: string;
  /** HTTP-метод (по умолчанию GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Заголовки запроса */
  headers?: HeadersInit;
  /** Тело запроса (будет автоматически сериализовано в JSON) */
  body?: any;
  /** Query-параметры (будут добавлены к URL) */
  params?: Record<string, any>;
}

/**
 * Опции composable.
 */
export interface UseApiOptions {
  /** Выполнить запрос сразу после создания composable */
  immediate?: boolean;
}

/**
 * Возвращаемый тип useApi.
 */
interface UseApiReturn<T = any> {
  /** Данные ответа */
  data: Ref<T | null>;
  /** Статус загрузки */
  loading: Ref<boolean>;
  /** Объект ошибки (если есть) */
  error: Ref<Error | null>;
  /** Успешность последнего запроса (true – успех) */
  success: Ref<boolean>;
  /** HTTP-статус ответа */
  status: Ref<number | null>;
  /** Метод для выполнения (или повторного выполнения) запроса */
  execute: (configOverride?: Partial<RequestConfig>) => Promise<T | null>;
}

/**
 * Универсальный composable для выполнения HTTP-запросов.
 * @param config – начальная конфигурация запроса
 * @param options – опции (immediate)
 * @returns реактивные состояния и метод execute
 */
export function useApi<T = any>(
  config: RequestConfig,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const success = ref(false);
  const status = ref<number | null>(null);

  let abortController: AbortController | null = null;

  /**
   * Формирует URL с query-параметрами.
   */
  const buildUrl = (baseUrl: string, params?: Record<string, any>): string => {
    if (!params) return baseUrl;
    const url = new URL(baseUrl, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    return url.toString();
  };

  /**
   * Выполняет запрос.
   * @param override – переопределяющие параметры запроса
   */
  const execute = async (override?: Partial<RequestConfig>): Promise<T | null> => {
    // Отменяем предыдущий запрос, если он ещё выполняется
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    const mergedConfig: RequestConfig = { ...config, ...override };
    const { url, method = 'GET', headers = {}, body, params } = mergedConfig;

    const requestUrl = buildUrl(url, params);
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    //   signal: abortController.signal,
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    loading.value = true;
    error.value = null;
    success.value = false;
    status.value = null;

    try {
      const response = await fetch(requestUrl, requestOptions);
      status.value = response.status;

      let responseData: any = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      data.value = responseData;
      success.value = true;
      return responseData as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Запрос был отменён – не считаем ошибкой
        return null;
      }
      error.value = err;
      success.value = false;
      return null;
    } finally {
      loading.value = false;
      abortController = null;
    }
  };

  // Если указано immediate, выполняем запрос сразу
  if (options.immediate) {
    execute();
  }

  return {
    data,
    loading,
    error,
    success,
    status,
    execute,
  };
}