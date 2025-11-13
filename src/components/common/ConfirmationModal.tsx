// src/components/common/ConfirmationModal.tsx
import React from 'react';

export type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText?: string;
  cancelText?: string;
  children?: React.ReactNode;
  /** Mostra loading e desabilita o botão de confirmar */
  isLoading?: boolean; // <-- A ADIÇÃO CHAVE
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  children,
  isLoading = false, // <-- A ADIÇÃO CHAVE
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-6 text-white shadow-xl">
        <h2 className="mb-3 text-lg font-semibold">{title}</h2>
        <div className="mb-6 text-sm text-gray-300">{children}</div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-gray-700 px-4 py-2 text-sm hover:bg-gray-600"
            disabled={isLoading} // <-- Lógica aplicada
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading} // <-- Lógica aplicada
            className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
          >
            {/* Lógica do Spinner (Perfeito) */}
            {isLoading && (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  fill="currentColor"
                  className="opacity-75"
                />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}