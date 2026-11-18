import Link from "next/link";
import { Wrench, MapPin, Phone, Mail, Share2, Camera } from "lucide-react";

const footerLinks = {
  company: [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Our Services", href: "/services" },
  ],
  support: [
    { name: "Contact Us", href: "/about#contact" },
    { name: "Sign In", href: "/sign-in" },
    { name: "Create Account", href: "/sign-up" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-5 flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Wrench size={22} />
              </div>
              <span className="text-2xl font-extrabold text-white">
                Fix<span className="text-blue-500">Mate</span>
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-7 text-slate-400">
              Your trusted partner for device and home appliance repairs. Find
              skilled technicians and get your problems fixed with ease.
            </p>

            <div className="mt-6 flex gap-3">
              <Link
                href="#"
                aria-label="Facebook"
                className="rounded-lg bg-slate-800 p-2.5 transition hover:bg-blue-600"
              >
                <Share2 size={18} />
              </Link>
              <Link
                href="#"
                aria-label="Instagram"
                className="rounded-lg bg-slate-800 p-2.5 transition hover:bg-blue-600"
              >
                <Camera size={18} />
              </Link>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="mb-5 font-semibold text-white">Company</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-blue-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="mb-5 font-semibold text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-blue-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 font-semibold text-white">Get in Touch</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-center gap-3">
                <MapPin className="size-5 shrink-0 text-blue-500" />
                Dhaka, Bangladesh
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-5 shrink-0 text-blue-500" />
                +880 1XXX-XXXXXX
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-5 shrink-0 text-blue-500" />
                support@fixmate.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-slate-800 pt-7 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} FixMate. All rights reserved.</p>
          <p>Made with care for a hassle-free repair experience.</p>
        </div>
      </div>
    </footer>
  );
}
