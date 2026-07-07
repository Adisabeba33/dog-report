import type { Database, NoteTemplate } from "./types";
import { newId, nowISO } from "./id";
import { todayISO, addDays } from "./date";

export const DEFAULT_TEMPLATES: Omit<NoteTemplate, "id" | "created_at" | "updated_at">[] = [
  { title: "Great walk", text: "Had a great walk today. Was very playful and happy.", category: "Positive" },
  { title: "Calm walk", text: "Was calm and relaxed on our walk today.", category: "Positive" },
  { title: "High energy walk", text: "Full of energy today and loved every minute of the walk.", category: "Positive" },
  { title: "Did pee and poop", text: "Did both pee and poop on the walk.", category: "Bathroom" },
  { title: "Nervous around traffic", text: "Was a little nervous around traffic but settled quickly.", category: "Behavior" },
  { title: "Pulled on leash", text: "Pulled a bit on the leash at first but listened well after.", category: "Behavior" },
  { title: "Enjoyed the park", text: "Enjoyed sniffing around the park and greeting other dogs.", category: "Positive" },
];

export function emptyDatabase(): Database {
  const ts = nowISO();
  return {
    settings: {
      business_name: "",
      walker_name: "",
      phone: "",
      email: "",
      logo_url: "",
      default_signature: "Sent with care",
      default_duration_minutes: 30,
      default_template_id: null,
      accent: "#9CAF88",
      onboarded: false,
    },
    clients: [],
    dogs: [],
    walks: [],
    reports: [],
    templates: DEFAULT_TEMPLATES.map((t) => ({
      ...t,
      id: newId(),
      created_at: ts,
      updated_at: ts,
    })),
  };
}

// Rich demo dataset so the app is explorable immediately on first run.
export function seededDatabase(): Database {
  const db = emptyDatabase();
  const ts = nowISO();
  db.settings = {
    ...db.settings,
    business_name: "Happy Paws Walks",
    walker_name: "Alex",
    phone: "(555) 010-2233",
    email: "alex@happypaws.example",
    logo_url: "",
    default_signature: "Sent with care by Happy Paws Walks",
    default_duration_minutes: 30,
    default_template_id: db.templates[0].id,
    accent: "#9CAF88",
    onboarded: true,
  };

  const sarah = {
    id: newId(),
    owner_name: "Sarah Bennett",
    phone: "(555) 133-9080",
    email: "sarah.b@example.com",
    address: "123 Bedford Ave, Brooklyn",
    apartment_info: "Apt 4R",
    access_instructions: "Use the back entrance. Key in lockbox, code 4417.",
    preferred_report_method: "share" as const,
    emergency_contact_name: "James Bennett",
    emergency_contact_phone: "(555) 133-1200",
    payment_notes: "Pays monthly via bank transfer.",
    private_notes: "Prefers reports before 6pm. Avoid the neighbor's large dog.",
    created_at: ts,
    updated_at: ts,
  };
  const marcus = {
    id: newId(),
    owner_name: "Marcus Reed",
    phone: "(555) 220-4471",
    email: "marcus.reed@example.com",
    address: "88 Grand St, Brooklyn",
    apartment_info: "Ground floor, blue door",
    access_instructions: "Ring buzzer #2. Dog gate at kitchen.",
    preferred_report_method: "email" as const,
    emergency_contact_name: "Dana Reed",
    emergency_contact_phone: "(555) 220-0091",
    payment_notes: "Weekly cash, leaves envelope on counter.",
    private_notes: "",
    created_at: ts,
    updated_at: ts,
  };
  db.clients = [sarah, marcus];

  const luna = {
    id: newId(),
    client_id: sarah.id,
    name: "Luna",
    breed: "Border Collie",
    age: "3 years",
    photo_url: "",
    temperament: "Friendly but reactive to scooters.",
    leash_behavior: "Pulls during the first 5 minutes, then settles.",
    medical_notes: "None.",
    allergies: "Chicken.",
    feeding_instructions: "No treats before noon.",
    water_instructions: "Give water after the walk.",
    favorite_route: "Loop through McCarren Park.",
    avoid_notes: "Large dogs, bikes.",
    private_notes: "Gets anxious if walk is longer than 45 min.",
    created_at: ts,
    updated_at: ts,
  };
  const max = {
    id: newId(),
    client_id: sarah.id,
    name: "Max",
    breed: "Golden Retriever",
    age: "5 years",
    photo_url: "",
    temperament: "Gentle, loves everyone.",
    leash_behavior: "Walks nicely, occasional sniff stops.",
    medical_notes: "Mild hip stiffness — keep pace easy.",
    allergies: "None.",
    feeding_instructions: "",
    water_instructions: "Water halfway and after.",
    favorite_route: "River path.",
    avoid_notes: "Puddles (hates getting paws wet).",
    private_notes: "",
    created_at: ts,
    updated_at: ts,
  };
  const bella = {
    id: newId(),
    client_id: marcus.id,
    name: "Bella",
    breed: "French Bulldog",
    age: "2 years",
    photo_url: "",
    temperament: "Playful and social.",
    leash_behavior: "Good on leash.",
    medical_notes: "Sensitive to heat — short walks when hot.",
    allergies: "None known.",
    feeding_instructions: "",
    water_instructions: "Offer water frequently in warm weather.",
    favorite_route: "Shady side streets.",
    avoid_notes: "Midday heat.",
    private_notes: "",
    created_at: ts,
    updated_at: ts,
  };
  db.dogs = [luna, max, bella];

  const today = todayISO();
  const mk = (
    dog: typeof luna,
    date: string,
    winStart: string,
    winEnd: string,
    dur: number,
    status: any,
    note = "",
  ) => ({
    id: newId(),
    client_id: dog.client_id,
    dog_id: dog.id,
    scheduled_date: date,
    window_start: winStart,
    window_end: winEnd,
    scheduled_start_time: winStart,
    scheduled_end_time: winEnd,
    duration_minutes: dur,
    status,
    repeat_rule: "none" as const,
    repeat_days: [],
    repeat_group_id: null,
    address_override: "",
    private_notes: note,
    cancel_note: "",
    actual_start_time: null,
    created_at: ts,
    updated_at: ts,
  });

  db.walks = [
    mk(luna, today, "09:00", "10:00", 30, "scheduled", "Use back entrance. Avoid large dogs."),
    mk(max, today, "10:00", "12:00", 45, "scheduled"),
    mk(bella, today, "12:30", "14:00", 30, "scheduled"),
    mk(luna, addDays(today, 1), "09:00", "10:00", 30, "scheduled"),
    mk(max, addDays(today, 1), "10:00", "12:00", 45, "scheduled"),
    mk(luna, addDays(today, -1), "09:00", "10:00", 30, "completed"),
  ];

  // One past completed report for history.
  const pastWalk = db.walks[5];
  db.reports = [
    {
      id: newId(),
      walk_id: pastWalk.id,
      client_id: luna.client_id,
      dog_id: luna.id,
      date: pastWalk.scheduled_date,
      actual_start_time: "09:00",
      actual_end_time: "09:32",
      actual_duration_minutes: 32,
      mood: "Happy",
      energy: "Medium",
      pee: true,
      poop: true,
      water: true,
      food: false,
      towel_dry: false,
      meds: false,
      public_note:
        "Luna had a great walk today. She was calm, enjoyed sniffing around the park, and did both pee and poop. She got a little excited near other dogs but listened well.",
      private_note: "Slight limp early on, resolved after a minute.",
      photos: [],
      report_image_url: "",
      sent_at: ts,
      created_at: ts,
      updated_at: ts,
    },
  ];

  return db;
}
