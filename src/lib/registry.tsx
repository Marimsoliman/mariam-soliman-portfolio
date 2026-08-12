"use client";

import { createContext, useContext } from "react";

/** Provides a callback-ref factory keyed by element id, so the
 *  master timeline can look up any animated DOM element by id. */
export type RegisterFn = (id: string) => (el: HTMLElement | null) => void;

export const RegistryContext = createContext<RegisterFn>(() => () => {});

export function useReg(id: string) {
  const register = useContext(RegistryContext);
  return register(id);
}
