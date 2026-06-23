import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hargita Székely Néptáncszínház",
  description: "Modern, mobilbarát oldal a Hargita Székely Néptáncszínház eseményeinek, híreinek és galériáinak.",
};

const navigation = [
  { href: "/", label: "Főoldal" },
  { href: "/tarsulat", label: "Társulat" },
  { href: "/hirek", label: "Hírek" },
  { href: "/esemenyeink", label: "Eseményeink" },
  { href: "/galeria", label: "Galéria" },
  { href: "/kapcsolat", label: "Kapcsolat" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body>
        <header className="site-header">
          <Link href="/" className="brand" aria-label="Hargita Székely Néptáncszínház főoldal">
            <span className="brand-mark">H</span>
            <span>
              <strong>Hargita</strong>
              <small>Székely Néptáncszínház</small>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Fő navigáció">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div>
            <strong>Hargita Székely Néptáncszínház</strong>
            <p>Csíkszereda, Temesvári sugárút 6.</p>
          </div>
          <Link href="/admin">Admin</Link>
        </footer>
      </body>
    </html>
  );
}
