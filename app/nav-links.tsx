"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./i18n";

export default function NavLinks() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const LINKS = [
    { href: "/", label: t.nav.assistant },
    { href: "/vergleich", label: t.nav.vergleich },
  ];

  return (
    <div className="nav-links">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`nav-link${pathname === l.href ? " active" : ""}`}
        >
          {l.label}
        </Link>
      ))}
      <a
        href="mailto:titogngl66@gmail.com?subject=SHK%20F%C3%B6rder-Assistent%20%E2%80%93%20Demo%20anfragen"
        className="nav-cta"
      >
        {t.nav.demo}
      </a>
    </div>
  );
}
