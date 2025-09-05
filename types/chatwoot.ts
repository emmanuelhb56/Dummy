export interface WebhookPayload {
  current_conversation: any;
  event: string;
  message?: {
    id?: number;
    content?: string;
    message_type?: "incoming" | "outgoing" | "note";
    tags?: string[];
    sender?: { id?: number; name?: string; email?: string };
  };
  conversation?: ConversationData;
  meta?: { sender?: { id?: number; name?: string; email?: string } };
}

export interface ConversationData {
  contact_id: any;
  id: number;
  inbox_id: number;
  meta?: { 
    sender?: { id?: number };
    kb_counter?: Record<string, number>; // Contador interno de KB por controlTag
  };
  priority?: "low" | "medium" | "high";
  status?: "open" | "resolved" | "pending" | "spam" | "ignored" | "blocked";
  team?: { id: number };
  team_id?: number;
  assignee?: { id: number };
}

export interface ContactData {
  id?: number;
  name?: string;
  email?: string;
  phone_number?: string;
  payload?: Record<string, unknown>;
}

export interface Message {
  content: string;
  message_type: "incoming" | "outgoing" | "note";
  tags?: string[];
}

// ==================== KB ENTRY TYPES ====================

export type Priority = "low" | "medium" | "high";

export interface KBAction {
  addTags?: string[];
  removeTags?: string[];
  assignTeamId?: number; // mapea a tus TEAMS si lo deseas
  priority?: Priority;
  maxResponses?: number; // límite por conversación
  controlTag?: string; // etiqueta de control para el contador por conversación
}

export interface KBEntry {
  id: string; // slug único, ej. "timbrado"
  categoria: string;
  triggers: string[]; // palabras/phrases clave
  patterns?: string[]; // regex string opcionales
  examples?: string[]; // ejemplos de usuario
  response: string; // respuesta corta, directa y accionable
  followups?: string[]; // sugerencias de siguiente paso
  actions?: KBAction;
  tags?: string[]; // etiquetas a aplicar
}
