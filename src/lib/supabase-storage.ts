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
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    // Use a folder structure that matches typical RLS policies (public/userId/filename)
    const filePath = `public/${userId}/${fileName}`;

    // Upload the file to the 'profiles' bucket
    const { data, error } = await supabaseStorage.storage
      .from("profiles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabaseStorage.storage
      .from("profiles")
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
    const fullPath = filePath.includes("/profiles/")
      ? filePath.split("/profiles/")[1]
      : filePath;

    const { error } = await supabaseStorage.storage
      .from("profiles")
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
