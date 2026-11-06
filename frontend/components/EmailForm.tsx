"use client";

import SocialLinks from "@/components/SocialLinks";
import { AnimatePresence, motion } from "motion/react";
import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type FormStatus = "idle" | "loading";
type ToastTone = "success" | "error";

type ToastState = {
  tone: ToastTone;
  message: string;
} | null;

const TOAST_DURATION_MS = 4000;

export default function EmailForm() {
  const [agencia, setAgencia] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [toast, setToast] = useState<ToastState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, TOAST_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  function showToast(tone: ToastTone, message: string) {
    setToast({ tone, message });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !agencia.trim() ||
      !telefone.trim() ||
      !email.trim() ||
      status === "loading"
    ) {
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch(`${API_URL}/api/registos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          agencia: agencia.trim(),
          telefone: telefone.trim(),
          email: email.trim(),
        }),
      });

      if (response.status === 422) {
        const payload = await response.json();
        const errors = payload?.errors ?? {};
        const emailErrors = errors.email as string[] | undefined;
        const isDuplicate = emailErrors?.some((message) =>
          /unique|já|already|taken/i.test(message),
        );

        if (isDuplicate) {
          showToast("error", "Este e-mail já está registado.");
        } else if (errors.email) {
          showToast("error", "Indique um e-mail válido.");
        } else if (errors.telefone) {
          showToast("error", "Indique um número de telemóvel válido.");
        } else if (errors.agencia) {
          showToast("error", "Indique o nome da agência.");
        } else {
          showToast("error", "Verifique os dados e tente novamente.");
        }
        return;
      }

      if (!response.ok) {
        showToast("error", "Não foi possível reservar. Tente novamente.");
        return;
      }

      setAgencia("");
      setTelefone("");
      setEmail("");
      showToast("success", "Obrigado! Entraremos em contacto o mais breve possível.");
    } catch {
      showToast("error", "Não foi possível reservar. Tente novamente.");
    } finally {
      setStatus("idle");
    }
  }

  const toastNode = mounted
    ? createPortal(
        <AnimatePresence>
          {toast ? (
            <motion.div
              key={toast.message}
              className={`form-toast form-toast--${toast.tone}`}
              role={toast.tone === "error" ? "alert" : "status"}
              aria-live="polite"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="form-toast-message">{toast.message}</p>
              <button
                type="button"
                className="form-toast-dismiss"
                aria-label="Fechar notificação"
                onClick={() => setToast(null)}
              >
                ×
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )
    : null;

  return (
    <>
      <motion.form
        onSubmit={handleSubmit}
        className="email-interest-form"
        noValidate
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="email-interest-form-row">
          <div className="email-interest-form-field">
            <label className="visually-hidden" htmlFor="agencia">
              Agência
            </label>
            <input
              id="agencia"
              name="agencia"
              type="text"
              required
              autoComplete="organization"
              value={agencia}
              disabled={status === "loading"}
              onChange={(event) => setAgencia(event.target.value)}
              placeholder="Agência..."
              className="email-interest-form-input"
            />
          </div>

          <div className="email-interest-form-field">
            <label className="visually-hidden" htmlFor="telefone">
              Número de telemóvel
            </label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              required
              autoComplete="tel"
              value={telefone}
              disabled={status === "loading"}
              onChange={(event) => setTelefone(event.target.value)}
              placeholder="Telemóvel..."
              className="email-interest-form-input"
            />
          </div>
        </div>

        <div className="email-interest-form-field">
          <label className="visually-hidden" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            disabled={status === "loading"}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Indique o seu e-mail..."
            className="email-interest-form-input"
          />
        </div>

        <div className="email-interest-form-actions">
          <SocialLinks />
          <motion.button
            type="submit"
            className="email-interest-form-submit"
            disabled={status === "loading"}
            whileHover={{ scale: status === "loading" ? 1 : 1.03 }}
            whileTap={{ scale: status === "loading" ? 1 : 0.97 }}
          >
            {status === "loading" ? "A reservar..." : "Reservar"}
          </motion.button>
        </div>
      </motion.form>

      {toastNode}
    </>
  );
}
