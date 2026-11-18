"use client";

import { authClient, useSession } from "@/lib/auth-client";
import { Camera, Loader2, UserRound } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <ProfileForm key={user.id} user={user} />;
}

type ProfileUser = NonNullable<ReturnType<typeof useSession>["data"]>["user"];

function ProfileForm({ user }: { user: ProfileUser }) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [area, setArea] = useState(user.area || "");
  const [bio, setBio] = useState(user.bio || "");
  const [imageUrl, setImageUrl] = useState(user.image || "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(user.image || "");
  const [isSaving, setIsSaving] = useState(false);

  // Select profile image
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Upload image to ImgBB
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.imageUrl) {
      throw new Error(result.message || "Image upload failed.");
    }

    return result.imageUrl as string;
  };

  // Update profile
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    try {
      setIsSaving(true);

      let finalImageUrl = imageUrl;

      if (selectedImage) {
        finalImageUrl = await uploadImage(selectedImage);
      }

      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: finalImageUrl || undefined,
        phone: phone.trim(),
        area: area.trim(),
        bio: bio.trim(),
      });

      if (error) {
        throw new Error(error.message || "Could not update profile.");
      }

      setImageUrl(finalImageUrl);
      setSelectedImage(null);

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating your profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your personal information and profile details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile image */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-5 text-lg font-semibold">Profile Photo</h2>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border bg-muted">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-10 w-10 text-muted-foreground" />
              )}
            </div>

            <div>
              <label
                htmlFor="profile-image"
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                <Camera className="h-4 w-4" />
                Change Photo
              </label>

              <input
                id="profile-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />

              <p className="mt-2 text-xs text-muted-foreground">
                JPG, PNG or WEBP. Maximum 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Personal information */}
        <div className="space-y-5 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Personal Information</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={user.email || ""}
                readOnly
                className="w-full cursor-not-allowed rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="area" className="text-sm font-medium">
                Area / Location
              </label>
              <input
                id="area"
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your area"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Write something about yourself..."
            />
          </div>
        </div>

        {/* Account information */}
        <div className="space-y-3 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Account Information</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Role</label>
            <input
              value={user.role || "customer"}
              readOnly
              className="w-full cursor-not-allowed rounded-md border bg-muted px-3 py-2 text-sm capitalize text-muted-foreground"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
