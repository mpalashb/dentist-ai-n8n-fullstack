import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // If the error is PGRST116 (no rows returned), return null instead of throwing
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return data as Profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
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
    const { data, error } = await (supabase as any)
      .from("profiles")
      .insert([profile])
      .select()
      .single();

    if (error) {
      // If the error is a duplicate key error (profile already exists), fetch the existing profile
      if (error.code === "23505") {
        const { data: existingProfile } = await (supabase as any)
          .from("profiles")
          .select("*")
          .eq("id", profile.id)
          .single();
          
        if (existingProfile) {
          return existingProfile as Profile;
        }
      }
      throw error;
    }

    return data as Profile;
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
    const { data, error } = await (supabase as any)
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      // If the error is PGRST116 (no rows returned), create the profile first
      if (error.code === "PGRST116") {
        const newProfile: Omit<Profile, "updated_at"> = {
          id: userId,
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
          ...updates,
        };
        
        return await createProfile(newProfile);
      }
      throw error;
    }

    return data as Profile;
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
    const { error } = await (supabase as any)
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return true;
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
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("*");

    if (error) {
      throw error;
    }

    return data as Profile[];
  } catch (error) {
    console.error("Error fetching all profiles:", error);
    throw error;
  }
};