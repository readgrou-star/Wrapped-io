
export type FieldType = 'text' | 'email' | 'number' | 'date' | 'select' | 'dropdown';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  showInStory: boolean; // The key viral feature
  options?: string[]; // For select/dropdown inputs
}

export type StoryTemplate = 'gradient' | 'minimal' | 'bold' | 'neon';

export interface StoryConfig {
  template: StoryTemplate;
  accentColor: string;
  primaryText: string;
  secondaryText: string;
  showDate: boolean;
  showParticipantName: boolean;
  backgroundImage?: string;
}

// --- LANDING PAGE TYPES ---

export type BlockType = 'hero' | 'text' | 'features' | 'speakers';

export interface BlockStyle {
    backgroundColor?: string; // tailwind class e.g., 'bg-white', 'bg-slate-900'
    textColor?: string;      // tailwind class e.g., 'text-slate-900', 'text-white'
    textAlign?: 'left' | 'center' | 'right';
    padding?: 'sm' | 'md' | 'lg'; // sm=py-8, md=py-16, lg=py-24
}

export interface LandingBlock {
  id: string;
  type: BlockType;
  title?: string;
  content?: string;
  image?: string;
  items?: { title: string; desc: string; icon?: string }[];
  style?: BlockStyle;
}

export interface LandingConfig {
  blocks: LandingBlock[];
}

export interface Form {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'closed';
  fields: FormField[];
  storyConfig: StoryConfig;
  landingConfig: LandingConfig; // New field
  stats: {
    views: number;
    submissions: number;
    shares: number;
  };
  created_at?: string;
}

export interface Submission {
  id: string;
  form_id: string;
  data: Record<string, any>;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}
