// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Hook customizado que faz o "debounce" de um valor.
 * Útil para campos de busca, onde não queremos fazer uma
 * requisição a cada tecla digitada.
 *
 * @param value O valor a ser "atrasado" (ex: o texto da busca).
 * @param delay O tempo em milissegundos do atraso (ex: 500ms).
 * @returns O valor após o atraso.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // Estado para armazenar o valor "atrasado"
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cria um temporizador que só vai atualizar o
    // 'debouncedValue' após o 'delay' especificado
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Função de limpeza:
    // Isso é chamado se 'value' ou 'delay' mudarem
    // antes do temporizador acabar, cancelando o anterior.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Só re-executa se o valor ou o delay mudarem

  return debouncedValue;
}