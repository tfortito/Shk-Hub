"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Assistent" },
  { href: "/vergleich", label: "Vergleich" },
];

export default function NavLinks() {
  const pathname = usePathname();
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
    </div>
  );
}
