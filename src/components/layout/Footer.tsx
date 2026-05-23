import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const columns = [
  {
    title: "Plugins",
    links: [
      { label: "REFLEXION", href: "/plugins/reflexion" },
      { label: "REFRACTION", href: "/plugins/refraction" },
      { label: "INFLEXION", href: "/plugins/inflexion" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "The Opticks Collection", href: "/#opticks" },
      { label: "Contact", href: "mailto:hello@opticksaudio.com" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Support", href: "/#support" },
      { label: "Installation", href: "/#install" },
      { label: "System Requirements", href: "/#requirements" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background-elevated/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-2 space-y-4">
            <Logo />
            <p className="text-sm text-foreground-muted max-w-xs leading-relaxed">
              Where physics becomes sound. Professional audio plugins built
              from first principles.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs uppercase tracking-[0.18em] text-foreground-subtle font-medium mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground-muted hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-foreground-subtle">
            © {new Date().getFullYear()} Opticks Audio. All rights reserved.
          </p>
          <p className="text-xs text-foreground-subtle font-mono">
            VST3 · AU · AAX · Ableton · Logic · Pro Tools
          </p>
        </div>
      </div>
    </footer>
  );
}
