"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary, input, label, panel } from "@/lib/styles";
import { deleteMemberAction, moveMemberAction, updateMemberAction, type MemberFormState } from "./actions";
import { MemberLocalizedFields } from "./member-localized-fields";

const initialState: MemberFormState = {
  message: "",
  status: "idle",
};

type MemberRowActionsProps = {
  canMoveDown: boolean;
  canMoveUp: boolean;
  member: {
    bio: string | null;
    bioEn: string | null;
    bioRo: string | null;
    id: string;
    imageUrl: string | null;
    name: string;
    role: string;
    roleEn: string | null;
    roleRo: string | null;
  };
};

export function MemberRowActions({ canMoveDown, canMoveUp, member }: MemberRowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateMemberAction, initialState);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const deleteCloseButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setIsOpen(false);
      }
    }

    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPending]);

  useEffect(() => {
    if (!isDeleteOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDeleteOpen(false);
      }
    }

    deleteCloseButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleteOpen]);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    setIsOpen(false);
    router.refresh();
  }, [router, state.status]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-[46px] cursor-pointer items-center justify-center border-2 border-[#8a6400] bg-[#f3c14b] px-[18px] py-3 font-extrabold text-charcoal transition hover:bg-[#ffd76a]"
          type="button"
          onClick={() => setIsOpen(true)}
        >
          Módosítás
        </button>
        <button
          className="inline-flex min-h-[46px] cursor-pointer items-center justify-center border-2 border-[#7f1712] bg-thread-red px-[18px] py-3 font-extrabold text-surface-strong transition hover:bg-[#8f1f1a]"
          type="button"
          onClick={() => setIsDeleteOpen(true)}
        >
          Törlés
        </button>
        <form action={moveMemberAction}>
          <input name="id" type="hidden" value={member.id} />
          <input name="direction" type="hidden" value="up" />
          <button className={buttonSecondary} disabled={!canMoveUp} type="submit">
            Fel
          </button>
        </form>
        <form action={moveMemberAction}>
          <input name="id" type="hidden" value={member.id} />
          <input name="direction" type="hidden" value="down" />
          <button className={buttonSecondary} disabled={!canMoveDown} type="submit">
            Le
          </button>
        </form>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8" role="presentation">
          <section
            aria-labelledby={`edit-member-${member.id}`}
            aria-modal="true"
            className={`${panel} max-h-[min(820px,calc(100vh-64px))] w-full max-w-[900px] overflow-y-auto p-6`}
            role="dialog"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-line pb-4">
              <h2 className="font-serif text-[clamp(24px,3vw,34px)] font-bold leading-tight" id={`edit-member-${member.id}`}>
                Tag módosítása
              </h2>
              <button
                aria-label="Modal bezárása"
                className="grid size-9 shrink-0 place-items-center border border-line bg-surface-strong text-[20px] font-extrabold text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <form action={formAction} className="grid gap-4">
              <input name="id" type="hidden" value={member.id} />
              <label className={label}>
                Név
                <input className={input} defaultValue={member.name} name="name" required type="text" />
              </label>

              <label className={label}>
                Kép
                <input
                  accept="image/*"
                  className={`${input} file:mr-4 file:border-0 file:bg-thread-red file:px-3 file:py-2 file:font-extrabold file:text-surface-strong`}
                  name="memberImage"
                  type="file"
                />
              </label>

              {member.imageUrl ? (
                <div className="grid gap-2">
                  <p className="text-sm font-extrabold text-muted">Aktuális kép</p>
                  <Image
                    alt={`${member.name} aktuális portréja`}
                    className="aspect-square w-full max-w-[180px] border-2 border-line-strong object-cover"
                    height={180}
                    src={member.imageUrl}
                    width={180}
                  />
                </div>
              ) : null}

              <MemberLocalizedFields
                bio={member.bio}
                bioEn={member.bioEn}
                bioRo={member.bioRo}
                role={member.role}
                roleEn={member.roleEn}
                roleRo={member.roleRo}
              />

              {state.status === "error" ? (
                <p className="border border-thread-red bg-surface-strong px-3 py-2 text-sm font-extrabold text-thread-red">
                  {state.message}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
                <button className={buttonSecondary} type="button" onClick={() => setIsOpen(false)}>
                  Mégse
                </button>
                <button className={buttonPrimary} disabled={isPending} type="submit">
                  {isPending ? "Mentés..." : "Mentés"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {isDeleteOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8" role="presentation">
          <section
            aria-labelledby={`delete-member-${member.id}`}
            aria-modal="true"
            className={`${panel} w-full max-w-[460px] p-6`}
            role="dialog"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-line pb-4">
              <h2 className="font-serif text-[clamp(24px,3vw,34px)] font-bold leading-tight" id={`delete-member-${member.id}`}>
                Tag törlése
              </h2>
              <button
                aria-label="Modal bezárása"
                className="grid size-9 shrink-0 place-items-center border border-line bg-surface-strong text-[20px] font-extrabold text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
                ref={deleteCloseButtonRef}
                type="button"
                onClick={() => setIsDeleteOpen(false)}
              >
                ×
              </button>
            </div>

            <p className="text-base font-bold leading-relaxed text-charcoal">
              Biztosan törlöd ezt a tagot: <strong>{member.name}</strong>?
            </p>

            <div className="mt-6 flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
              <button className={buttonSecondary} type="button" onClick={() => setIsDeleteOpen(false)}>
                Mégse
              </button>
              <form action={deleteMemberAction}>
                <input name="id" type="hidden" value={member.id} />
                <button
                  className="inline-flex min-h-[46px] cursor-pointer items-center justify-center border-2 border-[#7f1712] bg-thread-red px-[18px] py-3 font-extrabold text-surface-strong transition hover:bg-[#8f1f1a]"
                  type="submit"
                >
                  Törlés
                </button>
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
