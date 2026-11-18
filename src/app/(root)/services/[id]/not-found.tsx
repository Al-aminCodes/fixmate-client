import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold">404</h1>

      <h2 className="mt-4 text-2xl font-semibold">Service Not Found</h2>

      <p className="mt-3 text-muted-foreground">
        This service may have been removed, is unavailable, or has not been
        approved.
      </p>

      <Link
        href="/services"
        className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
      >
        Explore Services
      </Link>
    </div>
  );
};

export default NotFound;
