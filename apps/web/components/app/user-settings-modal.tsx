"use client";

import { Lock, Mail, RefreshCw, Upload, User } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserSettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
};

function generateDicebearUrl(seed: string) {
  // Using Micah style from Dicebear
  const baseUrl = "https://api.dicebear.com/7.x/micah/svg";
  const params = new URLSearchParams({
    seed: seed,
    backgroundColor: "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    size: "200",
  });
  return `${baseUrl}?${params.toString()}`;
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter((part) => part.length > 0);
  if (parts.length === 0) {
    return name.slice(0, 2).toUpperCase();
  }
  const first = parts.at(0)?.slice(0, 1) ?? "";
  const last = parts.at(parts.length - 1)?.slice(0, 1) ?? "";
  return `${first}${last}`.toUpperCase();
}

export function UserSettingsModal({
  open,
  onOpenChange,
  user,
}: UserSettingsModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    user?.image || generateDicebearUrl(user?.email || ""),
  );
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateAvatar = () => {
    // Generate new avatar with random seed
    const randomSeed = `${user?.email}-${Date.now()}`;
    const newAvatarUrl = generateDicebearUrl(randomSeed);
    setAvatarUrl(newAvatarUrl);
    toast.success("Generated new avatar!");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string);
      setIsUploading(false);
      toast.success("Avatar uploaded successfully!");
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to upload avatar");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    // Validate password fields if changing password
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (formData.newPassword.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
      if (!formData.currentPassword) {
        toast.error("Current password is required to set new password");
        return;
      }
    }

    // Here you would typically make an API call to update user settings
    toast.success("Settings saved successfully!");
    onOpenChange(false);
  };

  const displayName = formData.name || user?.name || user?.email || "User";
  const initials = getInitials(displayName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-background text-primary text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateAvatar}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Profile Information</div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  <User className="inline mr-2 h-3 w-3" />
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">
                  <Mail className="inline mr-2 h-3 w-3" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Change Password</div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">
                  <Lock className="inline mr-2 h-3 w-3" />
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">
                  <Lock className="inline mr-2 h-3 w-3" />
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  placeholder="Enter new password (min. 8 characters)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">
                  <Lock className="inline mr-2 h-3 w-3" />
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
