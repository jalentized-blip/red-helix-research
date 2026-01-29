import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

/**
 * HOC to protect admin-only pages
 * Redirects non-admin users to home page
 */
export default function AdminProtectedRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          navigate(createPageUrl('Home'));
        }
      } catch (error) {
        setIsAdmin(false);
        navigate(createPageUrl('Home'));
      }
    };

    checkAdmin();
  }, [navigate]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-amber-50">Verifying access...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return children;
}