import { supabase } from "@/integrations/supabase/client";

export type VoiceRecord = {
  id: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  file_url: string;
  file_size: number | null;
  duration: number | null;
  transcript: string | null;
  language: string | null;
  tags: string[] | null;
  is_public: boolean;
  is_processed: boolean;
  processing_status: string | null;
  metadata: any | null;
};

export type VoiceRecordInsert = Omit<VoiceRecord, "id" | "created_at" | "updated_at">;
export type VoiceRecordUpdate = Partial<VoiceRecordInsert>;

/**
 * Get all voice records for the current user using Edge Function
 */
export const getVoiceRecords = async (limit = 10, offset = 0) => {
  const { data, error } = await supabase.functions.invoke("voice-retrieve", {
    method: "POST", // Change to POST to avoid issues with GET and body
    body: {
      limit,
      offset,
    },
  });

  if (error) {
    console.error("Error fetching voice records:", error);
    throw error;
  }

  return {
    records: (data?.records as VoiceRecord[]) || [],
    count: data?.pagination?.total || 0
  };
};

/**
 * Get a single voice record by ID using Edge Function
 */
export const getVoiceRecordById = async (id: string) => {
  const { data, error } = await supabase.functions.invoke("voice-retrieve", {
    method: "POST", // Change to POST to avoid issues with GET and body
    body: {
      id,
    },
  });

  if (error) {
    console.error("Error fetching voice record:", error);
    throw error;
  }

  return data?.record as VoiceRecord;
};

/**
 * Get voice records by profile ID using Edge Function
 */
export const getVoiceRecordsByProfile = async (profileId: string, limit = 10, offset = 0) => {
  const { data, error } = await supabase.functions.invoke("voice-retrieve", {
    method: "POST", // Change to POST to avoid issues with GET and body
    body: {
      profileId,
      limit,
      offset,
    },
  });

  if (error) {
    console.error("Error fetching voice records by profile:", error);
    throw error;
  }

  return {
    records: (data?.records as VoiceRecord[]) || [],
    count: data?.pagination?.total || 0
  };
};

/**
 * Create a new voice record using Edge Function
 */
export const createVoiceRecord = async (record: VoiceRecordInsert) => {
  const { data, error } = await supabase.functions.invoke("voice-records", {
    method: "POST",
    body: {
      record,
    },
  });

  if (error) {
    console.error("Error creating voice record:", error);
    throw error;
  }

  return data?.record as VoiceRecord;
};

/**
 * Update an existing voice record using Edge Function
 */
export const updateVoiceRecord = async (id: string, updates: VoiceRecordUpdate) => {
  const { data, error } = await supabase.functions.invoke("voice-update", {
    method: "PUT",
    body: {
      id,
      updates,
    },
  });

  if (error) {
    console.error("Error updating voice record:", error);
    throw error;
  }

  return data?.record as VoiceRecord;
};

/**
 * Delete a voice record using Edge Function
 */
export const deleteVoiceRecord = async (id: string) => {
  const { data, error } = await supabase.functions.invoke("voice-delete", {
    method: "DELETE",
    body: {
      id,
    },
  });

  if (error) {
    console.error("Error deleting voice record:", error);
    throw error;
  }

  return true;
};

/**
 * Upload an audio file using the voice-upload Edge Function
 * This function handles both file upload and record creation
 */
export const uploadAudioFile = async (
  file: File,
  title: string,
  description?: string,
  isPublic = false
) => {
  try {
    // Create form data for the file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    if (description) {
      formData.append('description', description);
    }
    
    formData.append('is_public', isPublic.toString());

    // Call the voice-upload edge function
    const { data, error } = await supabase.functions.invoke("voice-upload", {
      method: "POST",
      body: formData,
    });

    if (error) {
      console.error("Error uploading audio file:", error);
      throw error;
    }

    return {
      record: data?.record as VoiceRecord,
      file: {
        path: data?.file?.path,
        publicUrl: data?.file?.publicUrl,
        size: data?.file?.size,
      }
    };
  } catch (error) {
    console.error("Error uploading audio file:", error);
    throw error;
  }
};

/**
 * Upload an audio file to Supabase storage (legacy method)
 * Note: This function is kept for backward compatibility
 * but the uploadAudioFile function above should be used instead
 */
export const uploadAudioFileLegacy = async (file: File, userId: string) => {
  try {
    // Import the storage client dynamically to avoid circular dependencies
    const { supabaseStorage } = await import("@/integrations/supabase/storage-client");
    
    // Create a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    // Use a folder structure that matches typical RLS policies
    const filePath = `voice-records/${userId}/${fileName}`;

    // Upload the file to the 'records' bucket
    const { data, error } = await supabaseStorage.storage
      .from("records")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabaseStorage.storage
      .from("records")
      .getPublicUrl(filePath);

    // Log the URL for debugging
    console.log("Generated public URL:", publicUrlData.publicUrl);

    return {
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
      size: file.size,
    };
  } catch (error) {
    console.error("Error uploading audio file:", error);
    throw error;
  }
};

/**
 * Delete an audio file and its record using the voice-delete Edge Function
 * This function handles both record deletion and file deletion from storage
 */
export const deleteAudioFile = async (recordId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke("voice-delete", {
      method: "DELETE",
      body: {
        id: recordId,
      },
    });

    if (error) {
      console.error("Error deleting audio file:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting audio file:", error);
    throw error;
  }
};

/**
 * Delete an audio file from Supabase storage (legacy method)
 * Note: This function is kept for backward compatibility
 * but the deleteAudioFile function above should be used instead
 */
export const deleteAudioFileLegacy = async (filePath: string) => {
  try {
    // Import the storage client dynamically to avoid circular dependencies
    const { supabaseStorage } = await import("@/integrations/supabase/storage-client");
    
    const { error } = await supabaseStorage.storage
      .from("records")
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting audio file:", error);
    throw error;
  }
};

/**
 * Get voice records filtered by status using Edge Function
 */
export const getVoiceRecordsByStatus = async (
  status: string,
  limit = 10,
  offset = 0
) => {
  const { data, error } = await supabase.functions.invoke("voice-retrieve", {
    method: "POST", // Change to POST to avoid issues with GET and body
    body: {
      status,
      limit,
      offset,
    },
  });

  if (error) {
    console.error("Error fetching voice records by status:", error);
    throw error;
  }

  return {
    records: (data?.records as VoiceRecord[]) || [],
    count: data?.pagination?.total || 0
  };
};

/**
 * Search voice records by title or transcript using Edge Function
 */
export const searchVoiceRecords = async (
  query: string,
  limit = 10,
  offset = 0
) => {
  const { data, error } = await supabase.functions.invoke("voice-retrieve", {
    method: "POST", // Change to POST to avoid issues with GET and body
    body: {
      query,
      limit,
      offset,
    },
  });

  if (error) {
    console.error("Error searching voice records:", error);
    throw error;
  }

  return {
    records: (data?.records as VoiceRecord[]) || [],
    count: data?.pagination?.total || 0
  };
};