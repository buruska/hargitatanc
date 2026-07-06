import Image from "next/image";

export default function Loading() {
  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[100] grid place-items-center bg-surface-strong text-charcoal"
      role="status"
    >
      <div className="grid justify-items-center gap-5">
        <Image
          alt=""
          className="loading-logo-spin size-[104px] object-contain"
          height={104}
          priority
          src="/logo.png"
          width={104}
        />
        <p className="text-[15px] font-extrabold uppercase tracking-[0.14em] text-thread-red">
          Betöltés<span aria-hidden="true" className="loading-dots" />
          <span className="sr-only">...</span>
        </p>
      </div>
    </div>
  );
}
