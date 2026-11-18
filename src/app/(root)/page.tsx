import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Smartphone,
  Laptop,
  Snowflake,
  Refrigerator,
  Tv,
  WashingMachine,
  Zap,
  Search,
  Wrench,
  ClipboardList,
  CreditCard,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const services = [
  {
    title: "Smartphone Repair",
    category: "Smartphone",
    mode: "Shop Drop-off",
    price: "৳800",
    technician: "Alex Morgan",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700",
  },
  {
    title: "Laptop Servicing",
    category: "Laptop & PC",
    mode: "Home Visit",
    price: "৳1,200",
    technician: "David Wilson",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700",
  },
  {
    title: "AC Repair & Maintenance",
    category: "Air Conditioner",
    mode: "Home Visit",
    price: "৳1,000",
    technician: "Michael Lee",
    image: "https://images.unsplash.com/photo-1631545806609-3c7d5b6d9e4d?w=700",
  },
  {
    title: "Refrigerator Repair",
    category: "Refrigerator",
    mode: "Home Visit",
    price: "৳1,500",
    technician: "James Brown",
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=700",
  },
  {
    title: "Television Repair",
    category: "TV",
    mode: "Shop Drop-off",
    price: "৳900",
    technician: "Robert Smith",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=700",
  },
  {
    title: "Washing Machine Repair",
    category: "Washing Machine",
    mode: "Home Visit",
    price: "৳1,200",
    technician: "Daniel Martin",
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=700",
  },
];

const categories = [
  { name: "Smartphone", icon: Smartphone },
  { name: "Laptop & PC", icon: Laptop },
  { name: "AC", icon: Snowflake },
  { name: "Refrigerator", icon: Refrigerator },
  { name: "TV", icon: Tv },
  { name: "Washing Machine", icon: WashingMachine },
  { name: "Electrical", icon: Zap },
];

const steps = [
  {
    number: "01",
    title: "Find a Service",
    description: "Explore repair services and choose the right technician.",
    icon: Search,
  },
  {
    number: "02",
    title: "Send a Request",
    description: "Describe your problem and submit a repair request.",
    icon: ClipboardList,
  },
  {
    number: "03",
    title: "Get It Fixed",
    description: "Your technician accepts the job and repairs your device.",
    icon: Wrench,
  },
  {
    number: "04",
    title: "Pay After Completion",
    description: "Pay securely after your repair is completed.",
    icon: CreditCard,
  },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-sky-100">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2 lg:px-8">
          <div>
            <Badge className="mb-6 rounded-full bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-100">
              <ShieldCheck className="mr-2 size-4" />
              Trusted Repair Service Platform
            </Badge>

            <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Broken Device?
              <span className="block text-blue-600">We Fix It For You.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-slate-600 sm:text-lg">
              Find verified technicians for your devices and home appliances.
              Book reliable repair services and pay only after your job is
              completed.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="rounded-full bg-blue-600 px-7 hover:bg-blue-700"
              >
                <Link href="/services">
                  Explore Services
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-slate-300 px-7"
              >
                <Link href="/about">How It Works</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="size-5 text-blue-600" />
                Verified Technicians
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="size-5 text-blue-600" />
                Secure Payments
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative">
            <div className="absolute -left-6 -top-6 size-32 rounded-full bg-blue-200/60 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border-8 border-white shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200"
                alt="Professional technician repairing electronic equipment"
                className="h-[350px] w-full object-cover sm:h-[470px]"
              />
            </div>

            <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl sm:left-0">
              <div className="rounded-xl bg-green-100 p-3 text-green-600">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Quality Service</p>
                <p className="text-xs text-slate-500">
                  Trusted repair professionals
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="border-y bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 text-center sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            ["500+", "Happy Customers"],
            ["50+", "Skilled Technicians"],
            ["1,000+", "Repair Requests"],
            ["100%", "Secure Payments"],
          ].map(([number, label]) => (
            <div key={label}>
              <h3 className="text-3xl font-extrabold text-blue-600">
                {number}
              </h3>
              <p className="mt-2 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Services */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <Badge className="mb-3 bg-blue-100 text-blue-700 hover:bg-blue-100">
                Our Services
              </Badge>
              <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">
                Popular Repair Services
              </h2>
              <p className="mt-3 text-slate-500">
                Professional solutions for your everyday repair needs.
              </p>
            </div>

            <Button variant="outline" className="rounded-full">
              <Link href="/services">
                View All Services <ArrowUpRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card
                key={service.title}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <Badge className="absolute left-4 top-4 bg-white text-blue-700 hover:bg-white">
                    {service.category}
                  </Badge>
                </div>

                <CardContent className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Technician: {service.technician}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-500">{service.mode}</span>
                    <span className="font-bold text-blue-600">
                      From {service.price}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    className="mt-5 w-full rounded-xl border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <Link href="/services">
                      View Details <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Badge className="mb-3 bg-blue-100 text-blue-700 hover:bg-blue-100">
              Repair Categories
            </Badge>
            <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">
              What Do You Need to Fix?
            </h2>
            <p className="mt-3 text-slate-500">
              Choose a category and find the right repair service for you.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.name}
                  href={`/services?category=${encodeURIComponent(category.name)}`}
                  className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:border-blue-500 hover:bg-blue-50"
                >
                  <div className="mb-4 rounded-xl bg-blue-50 p-4 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="size-7" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-blue-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <Badge className="mb-3 bg-blue-100 text-blue-700 hover:bg-blue-100">
              Simple Process
            </Badge>
            <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">
              How FixMate Works
            </h2>
            <p className="mt-3 text-slate-500">
              Getting your device repaired is easier than ever.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative rounded-2xl bg-white p-7 shadow-sm"
                >
                  <span className="text-sm font-bold text-blue-600">
                    STEP {step.number}
                  </span>

                  <div className="my-5 flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <Icon className="size-7" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why choose FixMate */}
      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000"
              alt="Technician providing professional repair service"
              className="h-[400px] w-full object-cover"
            />
          </div>

          <div>
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
              Why Choose FixMate
            </Badge>

            <h2 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              Repair Services You Can Trust
            </h2>

            <p className="mt-4 leading-7 text-slate-500">
              We make it easy to connect with skilled technicians, track your
              repair requests, and pay securely after your service is completed.
            </p>

            <div className="mt-8 space-y-6">
              {[
                {
                  title: "Verified Technicians",
                  description: "Connect with skilled repair professionals.",
                  icon: ShieldCheck,
                },
                {
                  title: "Transparent Pricing",
                  description: "Know the starting price before booking.",
                  icon: Star,
                },
                {
                  title: "Pay After Service",
                  description: "Payment is available after job completion.",
                  icon: Clock,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <Icon className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button className="mt-9 rounded-full bg-blue-600 px-7 hover:bg-blue-700">
              <Link href="/services">
                Find a Technician <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-7 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Ready to Fix Your Device?
            </h2>
            <p className="mt-3 text-blue-100">
              Find a trusted technician and get started today.
            </p>
          </div>

          <Button
            size="lg"
            className="rounded-full bg-white px-8 text-blue-700 hover:bg-blue-50"
          >
            <Link href="/services">
              Browse Services <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
