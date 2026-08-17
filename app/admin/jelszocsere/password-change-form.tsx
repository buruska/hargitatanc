"use client";

import { useActionState, useState } from "react";
import { buttonPrimary, input, label } from "@/lib/styles";
import { changeRequiredPasswordAction, type ChangePasswordState } from "./actions";

const initialState: ChangePasswordState = {};

export function PasswordChangeForm() {
  const [state, formAction, isPending] = useActionState(changeRequiredPasswordAction, initialState);
  const [visibleFields, setVisibleFields] = useState({ password: false, confirmation: false });
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const passwordRequirements = [
    { label: "Legalább 12 karakter", met: password.length >= 12 },
    { label: "Legalább egy nagybetű", met: /[A-ZÁÉÍÓÖŐÚÜŰ]/.test(password) },
    { label: "Legalább egy kisbetű", met: /[a-záéíóöőúüű]/.test(password) },
    { label: "Legalább egy szám", met: /[0-9]/.test(password) },
    { label: "Legalább egy speciális karakter", met: /[^A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű0-9]/.test(password) },
    { label: "A jelszó és a megerősítés megegyezik", met: password.length > 0 && password === passwordConfirmation },
  ];
  const passwordRequirementsMet = passwordRequirements.every((requirement) => requirement.met);
  const submitButtonLabel = isPending
    ? "Mentés…"
    : passwordConfirmation && password !== passwordConfirmation
      ? "A jelszavak nem egyeznek"
      : !passwordRequirementsMet
        ? "Teljesítsd a jelszókövetelményeket"
        : "Új jelszó mentése";

  return (
    <form action={formAction} className="grid gap-4">
      <label className={label}>
        Új jelszó
        <PasswordInput
          describedBy="new-password-requirements"
          isVisible={visibleFields.password}
          name="password"
          value={password}
          onChange={setPassword}
          onToggle={() => setVisibleFields((fields) => ({ ...fields, password: !fields.password }))}
        />
        <ul className="grid gap-1.5 pt-1 text-xs font-bold" id="new-password-requirements">
          {passwordRequirements.map((requirement) => (
            <li className={`flex items-center gap-2 ${requirement.met ? "text-pine" : "text-muted"}`} key={requirement.label}>
              <span aria-hidden="true" className={`grid size-4 shrink-0 place-items-center rounded-full border ${requirement.met ? "border-pine bg-pine text-surface-strong" : "border-line-strong"}`}>
                {requirement.met ? "✓" : ""}
              </span>
              {requirement.label}
              <span className="sr-only">{requirement.met ? " – teljesítve" : " – még nincs teljesítve"}</span>
            </li>
          ))}
        </ul>
      </label>
      <label className={label}>
        Új jelszó megerősítése
        <PasswordInput
          isVisible={visibleFields.confirmation}
          name="passwordConfirmation"
          value={passwordConfirmation}
          onChange={setPasswordConfirmation}
          onToggle={() => setVisibleFields((fields) => ({ ...fields, confirmation: !fields.confirmation }))}
        />
      </label>
      {state.error ? <p className="border-2 border-thread-red/40 bg-thread-red/10 px-3 py-2.5 font-bold text-thread-red" role="alert">{state.error}</p> : null}
      <button
        className={`${buttonPrimary} disabled:cursor-not-allowed disabled:border-line-strong disabled:bg-line disabled:text-muted`}
        disabled={isPending || !passwordRequirementsMet}
        type="submit"
      >
        {submitButtonLabel}
      </button>
    </form>
  );
}

function PasswordInput({ describedBy, isVisible, name, onChange, onToggle, value }: { describedBy?: string; isVisible: boolean; name: string; onChange?: (value: string) => void; onToggle: () => void; value?: string }) {
  return (
    <span className="relative">
      <input aria-describedby={describedBy} autoComplete="new-password" className={`${input} w-full pr-11`} minLength={12} name={name} required type={isVisible ? "text" : "password"} value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} />
      <button aria-label={isVisible ? "Jelszó elrejtése" : "Jelszó megjelenítése"} className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center text-muted transition hover:text-charcoal" type="button" onClick={onToggle}>
        <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
          {isVisible ? (
            <><path d="m3 3 18 18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /><path d="M9.3 5.3A9.2 9.2 0 0 1 12 5c5 0 8.5 4.5 9.5 7a11.4 11.4 0 0 1-2.4 3.5M6.2 6.2A12.4 12.4 0 0 0 2.5 12c1 2.5 4.5 7 9.5 7 1.5 0 2.8-.4 4-1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></>
          ) : (
            <><path d="M2.5 12c1-2.5 4.5-7 9.5-7s8.5 4.5 9.5 7c-1 2.5-4.5 7-9.5 7s-8.5-4.5-9.5-7Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" /><circle cx="12" cy="12" fill="none" r="2.5" stroke="currentColor" strokeWidth="2" /></>
          )}
        </svg>
      </button>
    </span>
  );
}
