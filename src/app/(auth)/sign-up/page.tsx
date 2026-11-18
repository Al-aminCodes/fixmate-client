"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Wrench,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Role = "customer" | "technician";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("customer");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
    };

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      if (error) {
        toast.error(error.message || "Unable to create your account");
        return;
      }

      if (data) {
        toast.success("Account created successfully!");

        const dashboard =
          role === "technician"
            ? "/dashboard/technician"
            : "/dashboard/customer";

        router.replace(dashboard);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-blue-600">JOIN FIXMATE</p>

        <h2 className="text-3xl font-extrabold text-slate-950">
          Create your account
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Get started with your FixMate experience.
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
        {/* Full name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>

          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className="h-12 pl-10"
            />
          </div>

          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className="h-12 pl-10"
            />
          </div>

          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              className="h-12 pl-10 pr-11"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="space-y-1 text-xs">
            <p
              className={
                password.length >= 6 ? "text-green-600" : "text-slate-500"
              }
            >
              • At least 6 characters
            </p>
            <p
              className={
                /[A-Z]/.test(password) ? "text-green-600" : "text-slate-500"
              }
            >
              • At least one uppercase letter
            </p>
            <p
              className={
                /[a-z]/.test(password) ? "text-green-600" : "text-slate-500"
              }
            >
              • At least one lowercase letter
            </p>
          </div>

          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Role selection */}
        <div className="space-y-3">
          <Label>Select Your Role</Label>

          <RadioGroup
            value={role}
            onValueChange={(value) => setRole(value as Role)}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor="customer"
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                role === "customer"
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 hover:border-blue-300"
              }`}
            >
              <RadioGroupItem value="customer" id="customer" />

              <div>
                <UserRound className="mb-1 size-5 text-blue-600" />
                <p className="font-semibold text-slate-900">Customer</p>
                <p className="text-xs text-slate-500">Book services</p>
              </div>
            </Label>

            <Label
              htmlFor="technician"
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                role === "technician"
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 hover:border-blue-300"
              }`}
            >
              <RadioGroupItem value="technician" id="technician" />

              <div>
                <Wrench className="mb-1 size-5 text-blue-600" />
                <p className="font-semibold text-slate-900">Technician</p>
                <p className="text-xs text-slate-500">Offer services</p>
              </div>
            </Label>
          </RadioGroup>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full bg-blue-600 text-base hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-blue-600 hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
