import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      {children}
    </svg>
  );
}

const size = "size-4";

export function ParagraphIcon() {
  return <Icon className={size}><path d="M13 4v16M17 4v16M13 4H9a4 4 0 0 0 0 8h4M17 4h2" /></Icon>;
}

export function Heading2Icon() {
  return <Icon className={size}><path d="M4 6v12M12 6v12M4 12h8M16 12a3 3 0 1 1 6 0c0 3-6 3-6 6h6" /></Icon>;
}

export function Heading3Icon() {
  return <Icon className={size}><path d="M4 6v12M12 6v12M4 12h8M17 9h2a2 2 0 0 1 0 4h-1a2 2 0 0 1 0 4h2" /></Icon>;
}

export function BoldIcon() {
  return <Icon className={size}><path d="M7 5h6a4 4 0 0 1 0 8H7zM7 13h7a3 3 0 0 1 0 6H7z" /></Icon>;
}

export function ItalicIcon() {
  return <Icon className={size}><path d="M10 5h7M7 19h7M14 5 10 19" /></Icon>;
}

export function BulletListIcon() {
  return <Icon className={size}><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4" cy="6" fill="currentColor" r="1" stroke="none" /><circle cx="4" cy="12" fill="currentColor" r="1" stroke="none" /><circle cx="4" cy="18" fill="currentColor" r="1" stroke="none" /></Icon>;
}

export function FileUploadIcon() {
  return <Icon className={size}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M12 18v-6M9 15l3-3 3 3" /></Icon>;
}

export function LinkIcon() {
  return <Icon className={size}><path d="m10 13 4-4M7.5 15.5l-1 1a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0M16.5 8.5l1-1a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0" /></Icon>;
}

export function ImageIcon() {
  return <Icon className={size}><rect height="16" rx="1" width="18" x="3" y="4" /><circle cx="8.5" cy="9" r="1.5" /><path d="m4 17 5-5 4 4 2-2 5 5" /></Icon>;
}

export function UndoIcon() {
  return <Icon className={size}><path d="m9 7-5 5 5 5M5 12h8a6 6 0 0 1 6 6" /></Icon>;
}

export function RedoIcon() {
  return <Icon className={size}><path d="m15 7 5 5-5 5M19 12h-8a6 6 0 0 0-6 6" /></Icon>;
}
