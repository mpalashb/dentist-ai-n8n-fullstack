import { supabaseStorage } from "@/integrations/supabase/storage-client";

/**
 * Uploads a profile picture to Supabase storage
 * @param file The file to upload
 * @param userId The user ID to associate with the file
 * @returns The public URL of the uploaded file
 */
export const uploadProfilePicture = async (file: File, userId: string) => {
  try {
    // Create a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    // Use the same path structure as the edge function
    const filePath = `avatars/${fileName}`;

    // Upload the file to the 'avatars' bucket
    const { data, error } = await supabaseStorage.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabaseStorage.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
};

/**
 * Deletes a profile picture from Supabase storage
 * @param filePath The path of the file to delete
 */
export const deleteProfilePicture = async (filePath: string) => {
  try {
    // Extract the full path from the URL if needed
    let fullPath;
    if (filePath.includes("/avatars/")) {
      fullPath = filePath.split("/avatars/")[1];
    } else if (filePath.includes("/profiles/")) {
      // For backward compatibility with old URLs
      fullPath = filePath.split("/profiles/")[1];
    } else {
      fullPath = filePath;
    }

    const { error } = await supabaseStorage.storage
      .from("avatars")
      .remove([fullPath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    throw error;
  }
};
