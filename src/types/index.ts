export type UserRole = "admin" | "editor" | "viewer";

export type ProposalType = "training" | "software" | "salary";

export type ProposalStatus = "draft" | "sent" | "accepted" | "declined";

export type AIProvider = "anthropic" | "openai" | "google";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  invited_by: string | null;
  created_at: string;
}

export interface OrganizationType {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  default_intro: string | null;
  default_about: string | null;
  ai_tone_notes: string | null;
  active: boolean;
  sort_order: number;
}

export interface AIProviderModel {
  id: string;
  slug: string;
  provider: AIProvider;
  label: string;
  active: boolean;
  sort_order: number;
}

export interface Module {
  id: string;
  name: string;
  category: string;
  description: string | null;
  default_price: number;
  notes: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  proposal_type: ProposalType;
  org_type_id: string | null;
  default_modules: string[];
  sections: Record<string, string>;
  created_at: string;
}

export interface Proposal {
  id: string;
  share_uuid: string;
  title: string;
  type: ProposalType;
  status: ProposalStatus;
  client_name: string;
  client_contact: string | null;
  client_email: string | null;
  proposal_date: string;
  cover_note: string | null;
  org_type_id: string | null;
  template_id: string | null;
  ai_generated: boolean;
  scope_of_work: string | null;
  timeline_content: string | null;
  deliverables: string | null;
  training_package: string | null;
  include_hourly_page: boolean;
  hourly_rate_virtual: number | null;
  hourly_rate_onsite: number | null;
  hourly_purpose: string | null;
  hourly_service_areas: string[] | null;
  show_year2: boolean;
  deposit_amount: number | null;
  year2_total: number | null;
  proposal_content: Record<string, string> | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // joined
  org_type?: OrganizationType;
  modules?: ProposalModule[];
}

export interface ProposalModule {
  id: string;
  proposal_id: string;
  module_id: string;
  price_override: number | null;
  notes_override: string | null;
  sort_order: number;
  included: boolean;
  module?: Module;
}

export interface ConsultingRateSettings {
  id: string;
  rate_virtual: number;
  rate_onsite: number;
  travel_note: string | null;
  terms_minimum: string;
  terms_billing: string;
  terms_scope: string;
  updated_at: string;
}

export interface AISectionRequest {
  section: "scope" | "timeline" | "deliverables" | "intro" | "training_package" | "hourly_page" | "full";
  currentContent?: string;
  changeInstruction: string;
  proposalType: ProposalType;
  orgType?: string;
  clientName: string;
  model: string;
  modules?: string[];
}
