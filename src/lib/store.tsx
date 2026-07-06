"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import type {
  Database,
  Client,
  Dog,
  Walk,
  WalkReport,
  NoteTemplate,
  Settings,
} from "./types";
import { newId, nowISO } from "./id";
import { emptyDatabase, seededDatabase } from "./seed";
import { expandRepeats, attachGroupId } from "./repeat";
import { addDays, startOfWeek, weekDates } from "./date";

const STORAGE_KEY = "dog-report-db-v1";

// ---- persistence ------------------------------------------------------------

function loadDatabase(): Database {
  if (typeof window === "undefined") return emptyDatabase();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seededDatabase(); // first run → demo data
    const parsed = JSON.parse(raw) as Database;
    // Shallow-merge defaults so older saved data gains new fields.
    return { ...emptyDatabase(), ...parsed, settings: { ...emptyDatabase().settings, ...parsed.settings } };
  } catch {
    return seededDatabase();
  }
}

// ---- context ----------------------------------------------------------------

interface StoreValue {
  db: Database;
  ready: boolean;

  // settings
  updateSettings: (patch: Partial<Settings>) => void;

  // clients
  addClient: (data: Partial<Client>) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;

  // dogs
  addDog: (data: Partial<Dog>) => Dog;
  updateDog: (id: string, patch: Partial<Dog>) => void;
  deleteDog: (id: string) => void;
  getDog: (id: string) => Dog | undefined;
  dogsForClient: (clientId: string) => Dog[];

  // walks
  addWalk: (data: Partial<Walk>) => Walk;
  updateWalk: (id: string, patch: Partial<Walk>) => void;
  deleteWalk: (id: string) => void;
  getWalk: (id: string) => Walk | undefined;
  walksForDate: (date: string) => Walk[];
  walksForDog: (dogId: string) => Walk[];
  duplicateWalk: (id: string) => Walk | undefined;
  startWalk: (id: string) => void;
  cancelWalk: (id: string, note?: string) => void;
  copyWeek: (fromMonday: string, toMonday: string) => number;

  // reports
  addReport: (data: Partial<WalkReport>) => WalkReport;
  updateReport: (id: string, patch: Partial<WalkReport>) => void;
  deleteReport: (id: string) => void;
  getReport: (id: string) => WalkReport | undefined;
  reportForWalk: (walkId: string) => WalkReport | undefined;

  // templates
  addTemplate: (data: Partial<NoteTemplate>) => NoteTemplate;
  updateTemplate: (id: string, patch: Partial<NoteTemplate>) => void;
  deleteTemplate: (id: string) => void;

  // data mgmt
  resetDemo: () => void;
  clearAll: () => void;
  exportJSON: () => string;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database>(() => emptyDatabase());
  const [ready, setReady] = useState(false);
  const firstSave = useRef(true);

  // Hydrate from localStorage on mount (client only).
  useEffect(() => {
    setDb(loadDatabase());
    setReady(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!ready) return;
    if (firstSave.current) {
      firstSave.current = false;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // storage full or unavailable — ignore for MVP
    }
  }, [db, ready]);

  const mutate = useCallback((fn: (d: Database) => Database) => {
    setDb((prev) => fn(structuredCloneSafe(prev)));
  }, []);

  const value = useMemo<StoreValue>(() => {
    return {
      db,
      ready,

      updateSettings: (patch) =>
        mutate((d) => {
          d.settings = { ...d.settings, ...patch };
          return d;
        }),

      // ---- clients ----
      addClient: (data) => {
        const c: Client = {
          owner_name: "",
          phone: "",
          email: "",
          address: "",
          apartment_info: "",
          access_instructions: "",
          preferred_report_method: "",
          emergency_contact_name: "",
          emergency_contact_phone: "",
          payment_notes: "",
          private_notes: "",
          created_at: nowISO(),
          updated_at: nowISO(),
          ...data,
          id: data.id ?? newId(),
        };
        mutate((d) => {
          d.clients.push(c);
          return d;
        });
        return c;
      },
      updateClient: (id, patch) =>
        mutate((d) => {
          d.clients = d.clients.map((c) =>
            c.id === id ? { ...c, ...patch, updated_at: nowISO() } : c,
          );
          return d;
        }),
      deleteClient: (id) =>
        mutate((d) => {
          const dogIds = d.dogs.filter((x) => x.client_id === id).map((x) => x.id);
          d.dogs = d.dogs.filter((x) => x.client_id !== id);
          d.walks = d.walks.filter((w) => w.client_id !== id);
          d.reports = d.reports.filter((r) => r.client_id !== id && !dogIds.includes(r.dog_id));
          d.clients = d.clients.filter((c) => c.id !== id);
          return d;
        }),
      getClient: (id) => db.clients.find((c) => c.id === id),

      // ---- dogs ----
      addDog: (data) => {
        const dog: Dog = {
          client_id: "",
          name: "",
          breed: "",
          age: "",
          photo_url: "",
          temperament: "",
          leash_behavior: "",
          medical_notes: "",
          allergies: "",
          feeding_instructions: "",
          water_instructions: "",
          favorite_route: "",
          avoid_notes: "",
          private_notes: "",
          created_at: nowISO(),
          updated_at: nowISO(),
          ...data,
          id: data.id ?? newId(),
        };
        mutate((d) => {
          d.dogs.push(dog);
          return d;
        });
        return dog;
      },
      updateDog: (id, patch) =>
        mutate((d) => {
          d.dogs = d.dogs.map((x) =>
            x.id === id ? { ...x, ...patch, updated_at: nowISO() } : x,
          );
          return d;
        }),
      deleteDog: (id) =>
        mutate((d) => {
          d.walks = d.walks.filter((w) => w.dog_id !== id);
          d.reports = d.reports.filter((r) => r.dog_id !== id);
          d.dogs = d.dogs.filter((x) => x.id !== id);
          return d;
        }),
      getDog: (id) => db.dogs.find((x) => x.id === id),
      dogsForClient: (clientId) => db.dogs.filter((x) => x.client_id === clientId),

      // ---- walks ----
      addWalk: (data) => {
        const dog = db.dogs.find((x) => x.id === data.dog_id);
        let walk: Walk = {
          client_id: dog?.client_id ?? "",
          dog_id: "",
          scheduled_date: "",
          scheduled_start_time: "09:00",
          scheduled_end_time: "09:30",
          duration_minutes: db.settings.default_duration_minutes,
          status: "scheduled",
          repeat_rule: "none",
          repeat_days: [],
          repeat_group_id: null,
          address_override: "",
          private_notes: "",
          cancel_note: "",
          actual_start_time: null,
          created_at: nowISO(),
          updated_at: nowISO(),
          ...data,
          id: data.id ?? newId(),
        };
        walk = attachGroupId(walk);
        const extras = expandRepeats(walk);
        mutate((d) => {
          d.walks.push(walk, ...extras);
          return d;
        });
        return walk;
      },
      updateWalk: (id, patch) =>
        mutate((d) => {
          d.walks = d.walks.map((w) =>
            w.id === id ? { ...w, ...patch, updated_at: nowISO() } : w,
          );
          return d;
        }),
      deleteWalk: (id) =>
        mutate((d) => {
          d.walks = d.walks.filter((w) => w.id !== id);
          return d;
        }),
      getWalk: (id) => db.walks.find((w) => w.id === id),
      walksForDate: (date) =>
        db.walks
          .filter((w) => w.scheduled_date === date)
          .sort((a, b) => a.scheduled_start_time.localeCompare(b.scheduled_start_time)),
      walksForDog: (dogId) =>
        db.walks
          .filter((w) => w.dog_id === dogId)
          .sort(
            (a, b) =>
              (a.scheduled_date + a.scheduled_start_time).localeCompare(
                b.scheduled_date + b.scheduled_start_time,
              ),
          ),
      duplicateWalk: (id) => {
        const src = db.walks.find((w) => w.id === id);
        if (!src) return undefined;
        const copy: Walk = {
          ...src,
          id: newId(),
          repeat_rule: "none",
          repeat_days: [],
          repeat_group_id: null,
          status: "scheduled",
          actual_start_time: null,
          cancel_note: "",
          created_at: nowISO(),
          updated_at: nowISO(),
        };
        mutate((d) => {
          d.walks.push(copy);
          return d;
        });
        return copy;
      },
      startWalk: (id) =>
        mutate((d) => {
          d.walks = d.walks.map((w) =>
            w.id === id
              ? { ...w, status: "in_progress", actual_start_time: nowISO(), updated_at: nowISO() }
              : w,
          );
          return d;
        }),
      cancelWalk: (id, note = "") =>
        mutate((d) => {
          d.walks = d.walks.map((w) =>
            w.id === id ? { ...w, status: "canceled", cancel_note: note, updated_at: nowISO() } : w,
          );
          return d;
        }),
      copyWeek: (fromMonday, toMonday) => {
        const fromDates = weekDates(fromMonday);
        const toDates = weekDates(toMonday);
        let count = 0;
        mutate((d) => {
          const source = d.walks.filter((w) => fromDates.includes(w.scheduled_date));
          const created: Walk[] = source.map((w) => {
            const idx = fromDates.indexOf(w.scheduled_date);
            count++;
            return {
              ...w,
              id: newId(),
              scheduled_date: toDates[idx],
              status: "scheduled",
              repeat_rule: "none",
              repeat_days: [],
              repeat_group_id: null,
              actual_start_time: null,
              cancel_note: "",
              created_at: nowISO(),
              updated_at: nowISO(),
            };
          });
          d.walks.push(...created);
          return d;
        });
        return count;
      },

      // ---- reports ----
      addReport: (data) => {
        const r: WalkReport = {
          walk_id: "",
          client_id: "",
          dog_id: "",
          date: "",
          actual_start_time: "",
          actual_end_time: "",
          actual_duration_minutes: 0,
          mood: "",
          energy: "",
          pee: false,
          poop: false,
          water: false,
          food: false,
          public_note: "",
          private_note: "",
          photos: [],
          report_image_url: "",
          sent_at: null,
          created_at: nowISO(),
          updated_at: nowISO(),
          ...data,
          id: data.id ?? newId(),
        };
        mutate((d) => {
          d.reports.push(r);
          if (r.walk_id) {
            d.walks = d.walks.map((w) =>
              w.id === r.walk_id ? { ...w, status: "completed", updated_at: nowISO() } : w,
            );
          }
          return d;
        });
        return r;
      },
      updateReport: (id, patch) =>
        mutate((d) => {
          d.reports = d.reports.map((r) =>
            r.id === id ? { ...r, ...patch, updated_at: nowISO() } : r,
          );
          return d;
        }),
      deleteReport: (id) =>
        mutate((d) => {
          d.reports = d.reports.filter((r) => r.id !== id);
          return d;
        }),
      getReport: (id) => db.reports.find((r) => r.id === id),
      reportForWalk: (walkId) => db.reports.find((r) => r.walk_id === walkId),

      // ---- templates ----
      addTemplate: (data) => {
        const t: NoteTemplate = {
          title: "",
          text: "",
          category: "Custom",
          created_at: nowISO(),
          updated_at: nowISO(),
          ...data,
          id: data.id ?? newId(),
        };
        mutate((d) => {
          d.templates.push(t);
          return d;
        });
        return t;
      },
      updateTemplate: (id, patch) =>
        mutate((d) => {
          d.templates = d.templates.map((t) =>
            t.id === id ? { ...t, ...patch, updated_at: nowISO() } : t,
          );
          return d;
        }),
      deleteTemplate: (id) =>
        mutate((d) => {
          d.templates = d.templates.filter((t) => t.id !== id);
          return d;
        }),

      // ---- data mgmt ----
      resetDemo: () => {
        const fresh = seededDatabase();
        setDb(fresh);
      },
      clearAll: () => {
        const fresh = emptyDatabase();
        fresh.settings.onboarded = db.settings.onboarded;
        fresh.settings.business_name = db.settings.business_name;
        setDb(fresh);
      },
      exportJSON: () => JSON.stringify(db, null, 2),
    };
  }, [db, ready, mutate]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// Convenience: current week helpers reused by schedule screen.
export function currentWeekMonday(): string {
  return startOfWeek(new Date().toISOString().slice(0, 10));
}
export { addDays, weekDates, startOfWeek };

function structuredCloneSafe<T>(v: T): T {
  if (typeof structuredClone === "function") return structuredClone(v);
  return JSON.parse(JSON.stringify(v));
}
