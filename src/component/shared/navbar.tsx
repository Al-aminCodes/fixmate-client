import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowRight, Menu, Wrench } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About Us", href: "/about" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Wrench size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Fix<span className="text-blue-600">Mate</span>
            </h1>
            <p className="-mt-1 text-[10px] font-medium tracking-widest text-slate-500">
              REPAIR MADE SIMPLE
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center text-blue-500 justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100"
          >
            Sign In
          </Link>

          <Button
            render={<Link href="/sign-up" />}
            className="rounded-full bg-blue-600 hover:bg-blue-700"
          >
            Get Started <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>

        {/* Mobile navigation */}
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="md:hidden" />
            }
          >
            <Menu className="size-5" />
            <span className="sr-only">Open navigation menu</span>
          </SheetTrigger>

          <SheetContent side="right" className="w-[300px]">
            <div className="mb-8 mt-6">
              <Link href="/" className="text-2xl font-extrabold">
                Fix<span className="text-blue-600">Mate</span>
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <SheetClose
                  key={link.href}
                  render={
                    <Link
                      href={link.href}
                      className="rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    />
                  }
                >
                  {link.name}
                </SheetClose>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 ">
              <SheetClose
                render={
                  <Button
                    variant="outline"
                    className="text-blue-500"
                    render={<Link href="/sign-in" />}
                  />
                }
              >
                Sign In
              </SheetClose>

              <SheetClose
                render={
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    render={<Link href="/sign-up" />}
                  />
                }
              >
                Get Started
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
