import Link from "next/link";
import { Wrench, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Left branding panel */}
      <section className="relative hidden overflow-hidden bg-blue-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-xl bg-white p-3 text-blue-700">
            <Wrench size={26} />
          </div>
          <span className="text-3xl font-extrabold">FixMate</span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <p className="mb-4 font-semibold text-blue-200">
            YOUR TRUSTED REPAIR PARTNER
          </p>

          <h1 className="text-5xl font-extrabold leading-tight">
            Repair made simple. Life made easier.
          </h1>

          <p className="mt-6 leading-8 text-blue-100">
            Connect with skilled technicians, book reliable repair services, and
            enjoy a hassle-free experience with FixMate.
          </p>

          <div className="mt-10 space-y-5">
            {[
              { icon: ShieldCheck, text: "Trusted repair professionals" },
              { icon: Clock, text: "Convenient service booking" },
              { icon: CheckCircle2, text: "Pay after service completion" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.text} className="flex items-center gap-3">
                  <Icon size={21} className="text-blue-200" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-blue-200">
          © {new Date().getFullYear()} FixMate. All rights reserved.
        </p>

        <div className="absolute -bottom-32 -right-20 size-96 rounded-full border-[50px] border-blue-600/50" />
      </section>

      {/* Right form panel */}
      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 flex items-center justify-center gap-2 lg:hidden"
          >
            <Wrench className="text-blue-600" size={27} />
            <span className="text-2xl font-extrabold text-slate-900">
              Fix<span className="text-blue-600">Mate</span>
            </span>
          </Link>

          {children}
        </div>
      </section>
    </main>
  );
}
