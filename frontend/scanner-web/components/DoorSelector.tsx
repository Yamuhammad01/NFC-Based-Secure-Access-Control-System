"use client";

interface Props {
  selectedDoor: string;
  setSelectedDoor: (value: string) => void;
}

export const doors = [
  {
    id: "MAIN_GATE_01",
    name: "Main Gate",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    id: "LIBRARY_01",
    name: "Library",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: "SERVER_ROOM_01",
    name: "Server Room",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
  },
  {
    id: "ADMIN_OFFICE_01",
    name: "Admin Office",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

export default function DoorSelector({ selectedDoor, setSelectedDoor }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">
        Access Point
      </h2>

      {doors.map((door) => {
        const active = selectedDoor === door.id;
        return (
          <button
            key={door.id}
            id={`door-${door.id.toLowerCase()}`}
            onClick={() => setSelectedDoor(door.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left
                        transition-all active:scale-[0.98]
                        ${active
                          ? "bg-white/10 border-white/30 text-white"
                          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/8 hover:border-white/20"
                        }`}
          >
            <span className={`flex-shrink-0 ${active ? "text-white" : "text-gray-500"}`}>
              {door.icon}
            </span>
            <span className="font-medium">{door.name}</span>
            {active && (
              <span className="ml-auto w-2 h-2 rounded-full bg-white" />
            )}
          </button>
        );
      })}
    </div>
  );
}