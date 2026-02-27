import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Hook that provides a navigation callback to return to the game menu.
 * Replaces the old `onExit` prop pattern.
 */
export function useExitToMenu() {
  const navigate = useNavigate();
  return useCallback(() => navigate('/'), [navigate]);
}
