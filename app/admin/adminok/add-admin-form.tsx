"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { buttonPrimary, input, label } from "@/lib/styles";
import { createAdminAction, type CreateAdminState } from "./actions";

const initialState: CreateAdminState = {};

export function AddAdminForm({ canCreateMainAdmin }: { canCreateMainAdmin: boolean }) {
  const [state, formAction, isPending] = useActionState(createAdminAction, initialState);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) formRef.current?.reset(); }, [state.success]);

  return (
    <form action={formAction} className="grid gap-4" ref={formRef}>
      <div className="grid items-start gap-4 min-[620px]:grid-cols-2">
        <label className={`${label} content-start`}>E-mail<input autoComplete="off" className={input} name="email" required type="email" /></label>
        <label className={`${label} content-start`}>
          Ideiglenes jelszó
          <span className="relative">
            <input
              aria-describedby="admin-password-requirements"
              autoComplete="new-password"
              className={`${input} w-full pr-11`}
              minLength={12}
              name="password"
              required
              type={isPasswordVisible ? "text" : "password"}
            />
            <button
              aria-label={isPasswordVisible ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center text-muted transition hover:text-charcoal"
              type="button"
              onClick={() => setIsPasswordVisible((visible) => !visible)}
            >
              <PasswordVisibilityIcon isVisible={isPasswordVisible} />
            </button>
          </span>
          <span className="text-xs font-bold leading-relaxed text-muted" id="admin-password-requirements">
            A jelszónak legalább 12 karakter hosszúnak kell lennie.
          </span>
        </label>
      </div>
      {canCreateMainAdmin ? (
        <label className={label}>Jogosultság<select className={input} defaultValue="MAIN_ADMIN" name="role"><option value="MAIN_ADMIN">Főadmin</option><option value="ADMIN">Admin</option></select></label>
      ) : <input name="role" type="hidden" value="ADMIN" />}
      {state.error ? <p className="border-2 border-thread-red/40 bg-thread-red/10 px-3 py-2.5 font-bold text-thread-red" role="alert">{state.error}</p> : null}
      {state.success ? <p className="border-2 border-pine/40 bg-pine/10 px-3 py-2.5 font-bold text-pine" role="status">{state.success}</p> : null}
      <button className={`${buttonPrimary} w-fit`} disabled={isPending} type="submit">
        {isPending ? "Létrehozás…" : canCreateMainAdmin ? "Adminisztrátor hozzáadása" : "Admin hozzáadása"}
      </button>
    </form>
  );
}

function PasswordVisibilityIcon({ isVisible }: { isVisible: boolean }) {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      {isVisible ? (
        <>
          <path d="m3 3 18 18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          <path d="M9.3 5.3A9.2 9.2 0 0 1 12 5c5 0 8.5 4.5 9.5 7a11.4 11.4 0 0 1-2.4 3.5M6.2 6.2A12.4 12.4 0 0 0 2.5 12c1 2.5 4.5 7 9.5 7 1.5 0 2.8-.4 4-1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </>
      ) : (
        <>
          <path d="M2.5 12c1-2.5 4.5-7 9.5-7s8.5 4.5 9.5 7c-1 2.5-4.5 7-9.5 7s-8.5-4.5-9.5-7Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
          <circle cx="12" cy="12" fill="none" r="2.5" stroke="currentColor" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}
