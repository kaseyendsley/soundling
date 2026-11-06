"use client";

// Form to hand-enter a new lead. Assembles a complete Lead (filling in the
// system fields — id, discoveredAt, a "Manual entry" source, the initial
// status-history row), saves it through the store, then returns to the
// dashboard where it now appears.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addLead } from "@/lib/leadsStore";
import { useDashboardHeader } from "@/components/DashboardHeaderContext";
import {
  LEAD_STATUS_LABELS,
  SIGNAL_LABELS,
  VENUE_TYPE_LABELS,
  type DiscoverySignal,
  type Lead,
  type LeadStatus,
  type VenueType,
} from "@/lib/types";

type ContactDraft = { name: string; role: string; phone: string; email: string };
const EMPTY_CONTACT: ContactDraft = { name: "", role: "", phone: "", email: "" };

const inputClass =
  "w-full rounded-full border border-stone-300 bg-white px-4 py-2 text-sm focus:border-magenta-400 focus:ring-2 focus:ring-magenta-100 focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-stone-500";

export default function AddLeadForm() {
  const router = useRouter();
  const { setTitle } = useDashboardHeader();

  // Reflect this page in the topbar title; reset to the dashboard default on
  // leave (same pattern LeadsDashboard uses).
  useEffect(() => {
    setTitle("Add a Lead");
    return () => setTitle("Active Leads");
  }, [setTitle]);

  // Becomes true once a lead is saved — swaps the form for a confirmation
  // message just before we redirect back to the dashboard.
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<VenueType>("bar_restaurant_brewery");
  const [signal, setSignal] = useState<DiscoverySignal>("recently_opened");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [openedDate, setOpenedDate] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [note, setNote] = useState("");
  const [contacts, setContacts] = useState<ContactDraft[]>([]);

  const canSave = name.trim().length > 0;

  function updateContact(index: number, field: keyof ContactDraft, value: string) {
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;

    const now = new Date().toISOString();
    const lead: Lead = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      state: stateVal.trim(),
      postalCode: postalCode.trim(),
      signal,
      openedDate: openedDate || null,
      status,
      archived: false,
      discoveredAt: now,
      // A lead entered already past "New" implies prior contact.
      lastContactedAt: status === "new" ? null : now,
      note: note.trim(),
      contacts: contacts
        .filter((c) => c.name.trim().length > 0)
        .map((c) => ({
          id: crypto.randomUUID(),
          name: c.name.trim(),
          role: c.role.trim() || null,
          phone: c.phone.trim() || null,
          email: c.email.trim() || null,
        })),
      sources: [
        {
          id: crypto.randomUUID(),
          source: "Manual entry",
          url: null,
          discoveredAt: now,
        },
      ],
      statusHistory: [
        {
          id: crypto.randomUUID(),
          fromStatus: null,
          toStatus: status,
          changedBy: "Kasey",
          changedAt: now,
          note: "",
        },
      ],
    };

    addLead(lead);
    // Show a brief confirmation, then send them back to the dashboard where the
    // new lead now appears.
    setSaved(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (saved) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-magenta-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-magenta-100 text-2xl text-magenta-600">
            ✓
          </div>
          <h1 className="font-display text-2xl tracking-wide text-ink">
            Lead saved!
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Taking you back to your leads…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-stone-500 hover:text-ink"
      >
        ← Back to leads
      </Link>

      <h1 className="font-display text-3xl tracking-wide text-plum-600">Add A Lead</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6"
      >
        <div>
          <label className={labelClass}>Venue name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. The Blue Note"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as VenueType)}
              className={inputClass}
            >
              {Object.entries(VENUE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Signal</label>
            <select
              value={signal}
              onChange={(e) => setSignal(e.target.value as DiscoverySignal)}
              className={inputClass}
            >
              {Object.entries(SIGNAL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Street address</label>
          <input
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            placeholder="123 Main St"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input
              value={stateVal}
              onChange={(e) => setStateVal(e.target.value)}
              placeholder="TX"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>ZIP</label>
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Opened date (optional)</label>
            <input
              type="date"
              value={openedDate}
              onChange={(e) => setOpenedDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className={inputClass}
            >
              {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Venue note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Anything worth remembering about this venue…"
            className="w-full rounded-2xl border border-stone-300 p-4 text-sm focus:border-magenta-400 focus:ring-2 focus:ring-magenta-100 focus:outline-none"
          />
        </div>

        {/* Contacts — repeatable */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={labelClass}>Contacts (optional)</span>
            <button
              type="button"
              onClick={() => setContacts((prev) => [...prev, { ...EMPTY_CONTACT }])}
              className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600 hover:border-magenta-300 hover:text-magenta-700"
            >
              + Add contact
            </button>
          </div>
          {contacts.map((contact, i) => (
            <div
              key={i}
              className="grid grid-cols-1 gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:grid-cols-2"
            >
              <input
                value={contact.name}
                onChange={(e) => updateContact(i, "name", e.target.value)}
                placeholder="Name"
                className={inputClass}
              />
              <input
                value={contact.role}
                onChange={(e) => updateContact(i, "role", e.target.value)}
                placeholder="Role (optional)"
                className={inputClass}
              />
              <input
                value={contact.phone}
                onChange={(e) => updateContact(i, "phone", e.target.value)}
                placeholder="Phone (optional)"
                className={inputClass}
              />
              <input
                value={contact.email}
                onChange={(e) => updateContact(i, "email", e.target.value)}
                placeholder="Email (optional)"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() =>
                  setContacts((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="justify-self-start text-xs font-medium text-stone-500 hover:text-magenta-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-stone-100 pt-5">
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-full bg-magenta-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-magenta-700"
          >
            Save lead
          </button>
          <span className="text-xs text-stone-400">
            Saved in your browser for now — moves to the database once the
            backend is wired up.
          </span>
        </div>
      </form>
    </div>
  );
}
