export type ToastTone = "error" | "success";

export type ToastMessage = {
  id: number;
  title: string;
  message: string;
  tone: ToastTone;
};

type ToastProps = {
  toast: ToastMessage | null;
  onDismiss: () => void;
};

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) {
    return null;
  }

  return (
    <div className={`toast toast--${toast.tone}`} role="status" aria-live="polite">
      <div>
        <strong>{toast.title}</strong>
        <p>{toast.message}</p>
      </div>
      <button type="button" onClick={onDismiss} aria-label="Dismiss message">
        Dismiss
      </button>
    </div>
  );
}
