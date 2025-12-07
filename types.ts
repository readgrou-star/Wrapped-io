
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

// --- STORY CANVAS TYPES ---

export type StoryElementType = 'text' | 'image' | 'shape';

export interface StoryElementStyle {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
    borderRadius?: number;
    zIndex?: number;
    textAlign?: 'left' | 'center' | 'right';
    opacity?: number;
}

export interface StoryElement {
  id: string;
  type: StoryElementType;
  content?: string; // Text content or Image URL
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width?: number; // Percentage
  height?: number; // Percentage
  style: StoryElementStyle;
  isDynamic?: boolean; // If true, content is a variable key (e.g. 'name')
}

export interface StoryConfig {
  backgroundColor: string; // Hex or Gradient
  elements: StoryElement[];
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

export interface FormStyle {
    shadow: 'none' | 'sm' | 'md' | 'xl' | '2xl';
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    borderColor: string;
    backgroundColor: string;
}

export interface LandingConfig {
  blocks: LandingBlock[];
  formStyle?: FormStyle;
}

export interface Form {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'closed';
  fields: FormField[];
  storyConfig: StoryConfig;
  landingConfig: LandingConfig; 
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
