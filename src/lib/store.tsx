'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, PlatformConnection } from '@/types';
import defaultSettings from '@/data/settings.json';
import defaultPosts from '@/data/posts.json';

const STORAGE_KEY = 'autobnbs-state';

const initialPlatformConnections: PlatformConnection[] = [
  { platform: 'instagram', connected: false },
  { platform: 'facebook', connected: false },
  { platform: 'linkedin', connected: false },
  { platform: 'twitter', connected: false },
  { platform: 'tiktok', connected: false },
  { platform: 'buffer', connected: false },
];

const initialState: AppState = {
  posts: defaultPosts as AppState['posts'],
  generatedContent: [],
  platformConnections: initialPlatformConnections,
  settings: defaultSettings as AppState['settings'],
  isGenerating: false,
  selectedImage: null,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_POSTS':
      return { ...state, posts: action.payload };

    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] };

    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };

    case 'DELETE_POST':
      return { ...state, posts: state.posts.filter((p) => p.id !== action.payload) };

    case 'SET_GENERATED_CONTENT':
      return { ...state, generatedContent: action.payload };

    case 'ADD_GENERATED_CONTENT':
      return { ...state, generatedContent: [...action.payload, ...state.generatedContent] };

    case 'UPDATE_GENERATED_CONTENT':
      return {
        ...state,
        generatedContent: state.generatedContent.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case 'SET_IS_GENERATING':
      return { ...state, isGenerating: action.payload };

    case 'SET_PLATFORM_CONNECTIONS':
      return { ...state, platformConnections: action.payload };

    case 'UPDATE_PLATFORM_CONNECTION':
      return {
        ...state,
        platformConnections: state.platformConnections.map((pc) =>
          pc.platform === action.payload.platform ? action.payload : pc
        ),
      };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'SET_SELECTED_IMAGE':
      return { ...state, selectedImage: action.payload };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    if (typeof window === 'undefined') return init;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...init,
          ...parsed,
          isGenerating: false,
          selectedImage: null,
        };
      }
    } catch {
      // Ignore parse errors, use defaults
    }
    return init;
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    const toSave = {
      posts: state.posts,
      generatedContent: state.generatedContent,
      platformConnections: state.platformConnections,
      settings: state.settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state.posts, state.generatedContent, state.platformConnections, state.settings]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function useAppState(): AppState {
  return useAppContext().state;
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  return useAppContext().dispatch;
}
