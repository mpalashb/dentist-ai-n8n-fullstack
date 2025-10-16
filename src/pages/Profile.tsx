import { useState, useEffect, useRef } from "react";
import {
  Save,
  User as UserIcon,
  Shield,
  Bell,
  Calendar,
  MapPin,
  Camera,
  Key,
  Smartphone,
  Upload,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  uploadProfilePicture,
  deleteProfilePicture,
} from "@/lib/supabase-storage";
import {
  getProfile,
  createProfile,
  updateProfile,
  type Profile,
} from "@/services/profileService";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        try {
          const profileData = await getProfile(user.id);

          // If profile doesn't exist, create a default one
          if (!profileData) {
            const newProfile: Omit<Profile, "updated_at"> = {
              id: user.id,
              username: null,
              full_name: null,
              avatar_url: null,
              website: null,
              phone: null,
              bio: null,
              location: null,
              email_notifications: true,
              sms_notifications: false,
              marketing_emails: true,
              two_factor_auth: false,
              login_alerts: true,
            };

            try {
              const createdProfile = await createProfile(newProfile);
              setProfile(createdProfile);
            } catch (createError) {
              console.error("Error creating profile:", createError);
              toast.error("Failed to create profile");
            }
          } else {
            setProfile(profileData);
          }
        } catch (error) {
          console.error("Error loading profile:", error);
          toast.error("Failed to load profile data");
        }
      }
    };

    loadProfile();
  }, [user?.id]);

  // Update profile state
  const updateProfileState = (updates: Partial<Profile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profile?.full_name?.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (profile?.phone && !/^\+?[\d\s\-\(\)]+$/.test(profile.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (profile?.website && !/^https?:\/\/.+/.test(profile.website)) {
      newErrors.website = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      const updatedProfile = await updateProfile(user.id, {
        full_name: profile?.full_name || null,
        phone: profile?.phone || null,
        bio: profile?.bio || null,
        location: profile?.location || null,
        website: profile?.website || null,
        email_notifications: profile?.email_notifications ?? true,
        sms_notifications: profile?.sms_notifications ?? false,
        marketing_emails: profile?.marketing_emails ?? true,
        two_factor_auth: profile?.two_factor_auth ?? false,
        login_alerts: profile?.login_alerts ?? true,
      });

      // Update the local state with the returned profile
      setProfile(updatedProfile);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    if (!user?.id) {
      toast.error("You must be logged in to upload a profile picture");
      return;
    }

    setUploading(true);
    try {
      const publicUrl = await uploadProfilePicture(file, user.id);

      // Update the profile with the new avatar URL
      if (profile) {
        const updatedProfile = await updateProfile(user.id, {
          ...profile,
          avatar_url: publicUrl,
        });
        setProfile(updatedProfile);
      } else {
        // If profile doesn't exist, create it with the avatar URL
        const newProfile: Omit<Profile, "updated_at"> = {
          id: user.id,
          username: null,
          full_name: null,
          avatar_url: publicUrl,
          website: null,
          phone: null,
          bio: null,
          location: null,
          email_notifications: true,
          sms_notifications: false,
          marketing_emails: true,
          two_factor_auth: false,
          login_alerts: true,
        };

        const createdProfile = await createProfile(newProfile);
        setProfile(createdProfile);
      }

      toast.success("Profile picture uploaded successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemovePicture = async () => {
    if (profile?.avatar_url && user?.id) {
      try {
        // Extract the file path from the public URL
        const filePath = profile.avatar_url.split("/profiles/")[1];
        if (filePath) {
          await deleteProfilePicture(profile.avatar_url);
        }
        updateProfileState({ avatar_url: null });
        toast.success("Profile picture removed");
      } catch (error) {
        console.error("Error removing profile picture:", error);
        toast.error("Failed to remove profile picture");
      }
    } else {
      updateProfileState({ avatar_url: null });
      toast.success("Profile picture removed");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>

        {!profile ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                No Profile Found
              </CardTitle>
              <CardDescription>
                You don't have any profile yet. Create one to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={async () => {
                  if (!user?.id) return;

                  setLoading(true);
                  try {
                    const newProfile: Omit<Profile, "updated_at"> = {
                      id: user.id,
                      username: null,
                      full_name: null,
                      avatar_url: null,
                      website: null,
                      phone: null,
                      bio: null,
                      location: null,
                      email_notifications: true,
                      sms_notifications: false,
                      marketing_emails: true,
                      two_factor_auth: false,
                      login_alerts: true,
                    };

                    const createdProfile = await createProfile(newProfile);
                    setProfile(createdProfile);
                    toast.success("Profile created successfully!");
                  } catch (error) {
                    console.error("Error creating profile:", error);
                    toast.error("Failed to create profile");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Profile"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your profile details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                              {userInitials}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <Button
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                          onClick={handleUploadClick}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                      <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-lg font-medium">
                          {profile?.full_name || "Your Name"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUploadClick}
                            disabled={uploading}
                            className="gap-1"
                          >
                            {uploading ? (
                              <>
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-3 w-3" />
                                {profile?.avatar_url
                                  ? "Change Picture"
                                  : "Upload Picture"}
                              </>
                            )}
                          </Button>
                          {profile?.avatar_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRemovePicture}
                              className="gap-1"
                            >
                              <X className="h-3 w-3" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or GIF. Max size 10MB
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profile?.full_name || ""}
                          onChange={(e) =>
                            updateProfileState({ full_name: e.target.value })
                          }
                          placeholder="Enter your full name"
                          className={errors.fullName ? "border-red-500" : ""}
                        />
                        {errors.fullName && (
                          <p className="text-sm text-red-500">
                            {errors.fullName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profile?.phone || ""}
                          onChange={(e) =>
                            updateProfileState({ phone: e.target.value })
                          }
                          placeholder="+1 (555) 000-0000"
                          className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500">{errors.phone}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profile?.location || ""}
                          onChange={(e) =>
                            updateProfileState({ location: e.target.value })
                          }
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile?.bio || ""}
                        onChange={(e) =>
                          updateProfileState({ bio: e.target.value })
                        }
                        placeholder="Tell us about yourself"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={profile?.website || ""}
                        onChange={(e) =>
                          updateProfileState({ website: e.target.value })
                        }
                        placeholder="https://yourwebsite.com"
                        className={errors.website ? "border-red-500" : ""}
                      />
                      {errors.website && (
                        <p className="text-sm text-red-500">{errors.website}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>
                      Choose how you want to receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates for important events
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={profile?.email_notifications || false}
                        onCheckedChange={(checked) =>
                          updateProfileState({ email_notifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="sms-notifications">
                          SMS Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive text messages for urgent alerts
                        </p>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={profile?.sms_notifications || false}
                        onCheckedChange={(checked) =>
                          updateProfileState({ sms_notifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing-emails">
                          Marketing Emails
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about new features and promotions
                        </p>
                      </div>
                      <Switch
                        id="marketing-emails"
                        checked={profile?.marketing_emails || false}
                        onCheckedChange={(checked) =>
                          updateProfileState({ marketing_emails: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      Manage your account security and authentication
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="two-factor">
                          Two-Factor Authentication
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        id="two-factor"
                        checked={profile?.two_factor_auth || false}
                        onCheckedChange={(checked) =>
                          updateProfileState({ two_factor_auth: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="login-alerts">Login Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when someone logs into your account
                        </p>
                      </div>
                      <Switch
                        id="login-alerts"
                        checked={profile?.login_alerts || false}
                        onCheckedChange={(checked) =>
                          updateProfileState({ login_alerts: checked })
                        }
                      />
                    </div>

                    <div className="pt-4 border-t space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Password</Label>
                          <p className="text-sm text-muted-foreground">
                            Last changed 30 days ago
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Key className="h-4 w-4" />
                          Change Password
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Connected Devices</Label>
                          <p className="text-sm text-muted-foreground">
                            3 devices currently active
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage Devices
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Active Sessions
                    </CardTitle>
                    <CardDescription>
                      Manage your active sessions across devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Chrome on Windows</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>San Francisco, CA</span>
                            <span>•</span>
                            <span>Current session</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">Current</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Safari on iPhone</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>New York, NY</span>
                            <span>•</span>
                            <span>Last active 2 hours ago</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Firefox on macOS</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>London, UK</span>
                            <span>•</span>
                            <span>Last active 3 days ago</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave} disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
