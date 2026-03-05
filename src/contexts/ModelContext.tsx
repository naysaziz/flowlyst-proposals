"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";

interface ModelContextValue {
  model: string;
  setModel: (model: string) => void;
}

const ModelContext = createContext<ModelContextValue>({
  model: "claude-sonnet-4-6",
  setModel: () => {},
});

export function ModelProvider({
  children,
  defaultModel = "claude-sonnet-4-6",
}: {
  children: React.ReactNode;
  defaultModel?: string;
}) {
  const [model, setModelState] = useState(defaultModel);
  const supabase = createClient();

  const setModel = useCallback(
    async (newModel: string) => {
      setModelState(newModel);
      // Persist to user_preferences
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("user_preferences").upsert(
            { user_id: user.id, preferred_model: newModel },
            { onConflict: "user_id" }
          );
        }
      } catch {
        // Non-blocking — preference save failure is silently ignored
      }
    },
    [supabase]
  );

  // Sync from DB on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("user_preferences")
        .select("preferred_model")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.preferred_model) setModelState(data.preferred_model);
        });
    });
  }, [supabase]);

  return (
    <ModelContext.Provider value={{ model, setModel }}>
      {children}
    </ModelContext.Provider>
  );
}

export const useModel = () => useContext(ModelContext);
