import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { API_BASE_URL as API_URL } from '../config/api';

export type ProfileData = {
  id?: number;
  nombre: string;
  apellidos?: string;
  usuario: string;
  ubicacion: string;
  email?: string;
  celular?: string | null;
  foto_perfil?: string | null;
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
    apellidos: row.apellidos ?? '',
    usuario: row.nombre_usuario ?? '',
    ubicacion: formatearUbicacion(row),
    email: row.email ?? '',
    celular: row.celular ?? null,
    foto_perfil: row.foto_perfil ?? null,
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
      const payload = {
        nombre: data.nombre,
        apellidos: data.apellidos,
        nombre_usuario: data.usuario,
        email: data.email,
        celular: data.celular,
        ciudad: data.ciudad,
        colonia: data.colonia,
        calle: data.calle,
      };

      const res = await fetch(`${API_URL}/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const response = await res.json();
        throw new Error(response.error || `Error ${res.status} al actualizar el perfil`);
      }

      await refreshProfile();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron guardar los cambios');
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