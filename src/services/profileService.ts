import { supabase } from "@/integrations/supabase/client";
import { supabaseService } from "@/integrations/supabase/service-client";

export type Profile = {
  id: string;
  updated_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  two_factor_auth: boolean;
  login_alerts: boolean;
};

/**
 * Get a user's profile by ID
 * @param userId The user ID
 * @returns The profile data or null if not found
 */
export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-profile', {
      body: { userId }
    });

    if (error) {
      console.error("Error fetching profile via edge function:", error);
      throw error;
    }

    return data?.profile as Profile || null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

/**
 * Get a user's profile by ID using edge function
 * @param userId The user ID
 * @returns The profile data or null if not found
 */
export const getProfileViaEdgeFunction = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-profile', {
      body: { userId }
    });

    if (error) {
      console.error("Error fetching profile via edge function:", error);
      throw error;
    }

    return data?.profile as Profile || null;
  } catch (error) {
    console.error("Error fetching profile via edge function:", error);
    throw error;
  }
};

/**
 * Create a new profile
 * @param profile The profile data to create
 * @returns The created profile
 */
export const createProfile = async (
  profile: Omit<Profile, "updated_at">
): Promise<Profile> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-profile', {
      body: { profile }
    });

    if (error) {
      console.error("Error creating profile via edge function:", error);
      throw error;
    }

    return data?.profile as Profile;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
};

/**
 * Update a user's profile
 * @param userId The user ID
 * @param updates The profile data to update
 * @returns The updated profile
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<Omit<Profile, "id" | "updated_at">>
): Promise<Profile> => {
  try {
    const { data, error } = await supabase.functions.invoke('update-profile', {
      body: { userId, updates }
    });

    if (error) {
      console.error("Error updating profile via edge function:", error);
      throw error;
    }

    return data?.profile as Profile;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

/**
 * Delete a user's profile
 * @param userId The user ID
 * @returns True if deletion was successful
 */
export const deleteProfile = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-profile', {
      body: { userId }
    });

    if (error) {
      console.error("Error deleting profile via edge function:", error);
      throw error;
    }

    return data?.success || false;
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw error;
  }
};

/**
 * Get all profiles (admin function)
 * @returns Array of all profiles
 */
export const getAllProfiles = async (): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-all-profiles');

    if (error) {
      console.error("Error fetching all profiles via edge function:", error);
      throw error;
    }

    return data?.profiles as Profile[] || [];
  } catch (error) {
    console.error("Error fetching all profiles:", error);
    throw error;
  }
};

/**
 * Upload a profile picture using the edge function
 * @param file The file to upload
 * @param userId The user ID
 * @returns The public URL of the uploaded file
 */
export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const { data, error } = await supabase.functions.invoke('upload-avatar', {
      body: formData,
    });

    if (error) {
      console.error("Error uploading avatar via edge function:", error);
      throw error;
    }

    return data?.avatarUrl as string;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
};

/**
 * Delete a profile picture using the edge function
 * @param avatarUrl The URL of the avatar to delete
 * @returns True if deletion was successful
 */
export const deleteAvatar = async (avatarUrl: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-avatar', {
      body: { avatarUrl },
    });

    if (error) {
      console.error("Error deleting avatar via edge function:", error);
      throw error;
    }

    return data?.success || false;
  } catch (error) {
    console.error("Error deleting avatar:", error);
    throw error;
  }
};