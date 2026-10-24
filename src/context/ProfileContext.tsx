import { createContext, useContext, useState } from 'react';

type ProfileData = {
  nombre: string;
  usuario: string;
  ubicacion: string;
};

type ProfileContextType = {
  profile: ProfileData;
  updateProfile: (data: ProfileData) => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined
);

export function ProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<ProfileData>({
    nombre: 'Isa',
    usuario: 'isa',
    ubicacion: 'Aguascalientes, México',
  });

  const updateProfile = (data: ProfileData) => {
    setProfile(data);
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error(
      'useProfile debe utilizarse dentro de ProfileProvider'
    );
  }

  return context;
}