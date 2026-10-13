import React from 'react';
import Modal from './Modal';

/**
 * Confirmation dialog built on top of Modal.
 *
 * Props:
 *  - isOpen          {boolean}
 *  - onClose         {() => void}
 *  - onConfirm       {() => void}
 *  - title           {string}
 *  - message         {string}
 *  - confirmText     {string}   default 'Confirm'
 *  - confirmVariant  {'danger'|'primary'}  default 'primary'
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const confirmStyles =
    confirmVariant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {message && (
        <p className="mb-6 text-sm leading-relaxed text-gray-600">{message}</p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${confirmStyles}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
