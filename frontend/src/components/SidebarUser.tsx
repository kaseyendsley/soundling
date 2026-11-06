// The signed-in user's block: initials avatar, name + email, and settings /
// log-out icon buttons. Sits at the foot of the sidebar on md+ screens; the
// "compact" variant (avatar + icons only) goes in the mobile top bar. Both sit
// on the dark plum chrome, so text/icons use the light plum tones.
//
// There's no auth yet, so the user is hardcoded and the two buttons are
// placeholders. Once Django auth exists, CURRENT_USER comes from the session
// and the buttons get real handlers.

const CURRENT_USER = { name: "Kasey", email: "kasey@kaseyendsley.com" };

/** "Kasey Endsley" → "KE" */
function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

const iconButton =
  "rounded-full p-2 text-plum-300 hover:bg-plum-800 hover:text-magenta-300";

export default function SidebarUser({
  variant,
}: {
  variant: "sidebar" | "compact";
}) {
  const { name, email } = CURRENT_USER;
  return (
    <div
      className={
        variant === "sidebar"
          ? "flex items-center gap-2 border-t border-plum-800 px-4 py-4"
          : "flex items-center gap-1"
      }
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-magenta-600 text-sm font-semibold text-white"
        title={name}
      >
        {initials(name)}
      </span>
      {variant === "sidebar" && (
        // min-w-0 lets the text shrink so `truncate` can add the "…"
        <div className="min-w-0 flex-1 pl-1">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="truncate text-xs text-plum-300">{email}</p>
        </div>
      )}
      <button type="button" className={iconButton} aria-label="Settings" title="Settings">
        <GearIcon />
      </button>
      <button type="button" className={iconButton} aria-label="Log out" title="Log out">
        <LogOutIcon />
      </button>
    </div>
  );
}
