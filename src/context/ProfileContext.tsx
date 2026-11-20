import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';

const API_URL = 'http://localhost:3000';

export type ProfileData = {
  id?: number;
  nombre: string;
  usuario: string;
  ubicacion: string;
  ciudad?: string | null;
  colonia?: string | null;
  calle?: string | null;
};

type ProfileContextType = {
  userId: number | null;
  profile: ProfileData;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<boolean>;
};

const EMPTY_PROFILE: ProfileData = {
  nombre: '',
  usuario: '',
  ubicacion: '',
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

function formatearUbicacion(row: any): string {
  const partes = [row?.calle, row?.colonia, row?.ciudad]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean);
  return partes.length > 0 ? partes.join(', ') : 'Sin ubicación';
}

function mapearUsuario(row: any): ProfileData {
  return {
    id: row.id,
    nombre: row.nombre ?? '',
    usuario: row.nombre_usuario ?? '',
    ubicacion: formatearUbicacion(row),
    ciudad: row.ciudad ?? null,
    colonia: row.colonia ?? null,
    calle: row.calle ?? null,
  };
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ? Number(user.id) : null;

  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(EMPTY_PROFILE);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${userId}`);
      if (!res.ok) {
        throw new Error(`Error ${res.status} al cargar el perfil`);
      }
      const data = await res.json();
      const userObj = Array.isArray(data) ? data[0] : data;
      if (userObj) {
        setProfile(mapearUsuario(userObj));
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const updateProfile = async (data: Partial<ProfileData>): Promise<boolean> => {
    if (!userId) {
      setError('No hay una sesión activa.');
      return false;
    }

    setError(null);
    try {
      const payload: Record<string, any> = {
        nombre: data.nombre,
        nombre_usuario: data.usuario,
      };

      if (data.ciudad !== undefined) payload.ciudad = data.ciudad;
      if (data.colonia !== undefined) payload.colonia = data.colonia;
      if (data.calle !== undefined) payload.calle = data.calle;

      if (
        data.ubicacion !== undefined &&
        data.ciudad === undefined &&
        data.colonia === undefined &&
        data.calle === undefined
      ) {
        payload.ciudad = data.ubicacion.trim() || null;
      }

      const res = await fetch(`${API_URL}/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status} al actualizar el perfil`);
      }

      await refreshProfile();
      return true;
    } catch (err: any) {
      setError(err?.message || 'No se pudieron guardar los cambios');
      return false;
    }
  };

  return (
    <ProfileContext.Provider
      value={{ userId, profile, loading, error, refreshProfile, updateProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile debe utilizarse dentro de ProfileProvider');
  }
  return context;
}