import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getProfileViaEdgeFunction,
  type Profile,
} from "@/services/profileService";

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user?.id) {
      setLoading(true);
      try {
        const profileData = await getProfileViaEdgeFunction(user.id);
        setProfile(profileData);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [user?.id]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};
