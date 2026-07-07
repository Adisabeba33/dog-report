// Core domain types for the Dog Walking Schedule & Report app.
// The shapes mirror the spec's database structure so a Supabase/Postgres
// backend can later replace the local persistence layer without UI changes.

export type ID = string;
export type ISODate = string; // "2026-07-06"
export type ISODateTime = string; // full ISO timestamp
export type Time = string; // "09:00" (24h)

export type WalkStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "canceled"
  | "skipped";

export type RepeatRule = "none" | "weekly" | "custom";

export type Mood =
  | "Happy"
  | "Calm"
  | "Excited"
  | "Nervous"
  | "Tired"
  | "Playful"
  | "Relaxed";

export type Energy = "Low" | "Medium" | "High";

export interface Settings {
  business_name: string;
  walker_name: string;
  phone: string;
  email: string;
  logo_url: string; // data URL
  default_signature: string;
  default_duration_minutes: number;
  default_template_id: ID | null;
  accent: string; // hex accent color for reports
  onboarded: boolean;
}

export interface Client {
  id: ID;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  apartment_info: string;
  access_instructions: string;
  preferred_report_method: "share" | "email" | "text" | "";
  emergency_contact_name: string;
  emergency_contact_phone: string;
  payment_notes: string;
  private_notes: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface Dog {
  id: ID;
  client_id: ID;
  name: string;
  breed: string;
  age: string;
  photo_url: string; // data URL
  temperament: string;
  leash_behavior: string;
  medical_notes: string;
  allergies: string;
  feeding_instructions: string;
  water_instructions: string;
  favorite_route: string;
  avoid_notes: string;
  private_notes: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface Walk {
  id: ID;
  client_id: ID;
  dog_id: ID;
  scheduled_date: ISODate;
  // Scheduling uses a time window: the walk may happen any time between
  // window_start and window_end. When they are equal the walk is a fixed time.
  window_start: Time;
  window_end: Time;
  // Legacy alias kept in sync with window_start for older data / sorting.
  scheduled_start_time: Time;
  scheduled_end_time: Time;
  duration_minutes: number;
  status: WalkStatus;
  repeat_rule: RepeatRule;
  repeat_days: number[]; // 0=Sun..6=Sat, used when repeat_rule === "custom" | "weekly"
  repeat_group_id: ID | null; // links generated occurrences
  address_override: string;
  private_notes: string;
  cancel_note: string;
  actual_start_time: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface WalkReport {
  id: ID;
  walk_id: ID;
  client_id: ID;
  dog_id: ID;
  date: ISODate;
  actual_start_time: Time;
  actual_end_time: Time;
  actual_duration_minutes: number;
  mood: Mood | "";
  energy: Energy | "";
  pee: boolean;
  poop: boolean;
  water: boolean;
  food: boolean;
  towel_dry: boolean;
  meds: boolean;
  public_note: string;
  private_note: string;
  photos: string[]; // data URLs (report_photos folded in for local MVP)
  report_image_url: string;
  sent_at: ISODateTime | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface NoteTemplate {
  id: ID;
  title: string;
  text: string;
  category: string;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface Database {
  settings: Settings;
  clients: Client[];
  dogs: Dog[];
  walks: Walk[];
  reports: WalkReport[];
  templates: NoteTemplate[];
}
