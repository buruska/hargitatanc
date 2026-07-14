export const ticketModeValues = ["LINK", "VENUE", "FREE", "PASS", "CUSTOM"] as const;

export type TicketMode = (typeof ticketModeValues)[number];

export type TicketInfo = {
  ticketMode?: TicketMode | string;
  ticketText?: string;
  ticketUrl?: string;
};

export function getTicketDisplayText(ticket: TicketInfo) {
  if (ticket.ticketMode === "VENUE") {
    return "Jegyvásárlás a helyszínen";
  }

  if (ticket.ticketMode === "FREE") {
    return "Ingyenes";
  }

  if (ticket.ticketMode === "PASS") {
    return "Bérletes";
  }

  if (ticket.ticketMode === "CUSTOM") {
    return ticket.ticketText?.trim() || "Egyéb";
  }

  return ticket.ticketUrl ? "Jegyvásárlás" : "";
}

export function isTicketLink(ticket: TicketInfo) {
  return (ticket.ticketMode ?? "LINK") === "LINK" && Boolean(ticket.ticketUrl);
}
