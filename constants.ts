
import { Form, StoryConfig, LandingConfig } from './types';

export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  blocks: [
    {
      id: 'b1',
      type: 'hero',
      title: 'Web Dev Bootcamp Batch 10',
      content: 'Master Fullstack Development in 12 Weeks. Join the most intensive coding community.',
      style: {
          textAlign: 'center',
          backgroundColor: 'bg-white',
          textColor: 'text-slate-900',
          padding: 'lg'
      }
    },
    {
      id: 'b2',
      type: 'features',
      title: 'What you will learn',
      items: [
        { title: 'React & Next.js', desc: 'Build modern UIs' },
        { title: 'Node & Supabase', desc: 'Scalable backends' },
        { title: 'System Design', desc: 'Architect like a pro' }
      ],
      style: {
          textAlign: 'center',
          backgroundColor: 'bg-slate-50',
          textColor: 'text-slate-900',
          padding: 'md'
      }
    }
  ]
};

export const MOCK_FORMS: Form[] = [
  {
    id: 'f1',
    title: 'Web Dev Bootcamp Batch 10',
    description: 'Register for the upcoming intensive coding bootcamp.',
    status: 'active',
    created_at: '2023-10-15',
    stats: { views: 1205, submissions: 247, shares: 156 },
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', placeholder: 'Jane Doe', required: true, showInStory: true },
      { id: 'email', type: 'email', label: 'Email Address', placeholder: 'jane@example.com', required: true, showInStory: false },
      { id: 'exp', type: 'select', label: 'Experience Level', options: ['Beginner', 'Intermediate', 'Pro'], required: true, showInStory: true },
    ],
    storyConfig: {
      template: 'gradient',
      accentColor: '#6366F1',
      primaryText: "YOU'RE IN!",
      secondaryText: "See you at the bootcamp! 🚀",
      showDate: true,
      showParticipantName: true,
    },
    landingConfig: DEFAULT_LANDING_CONFIG
  }
];

export const DEFAULT_STORY_CONFIG: StoryConfig = {
  template: 'gradient',
  accentColor: '#8B5CF6',
  primaryText: "I'M GOING!",
  secondaryText: "Can't wait to see you there.",
  showDate: true,
  showParticipantName: true,
};

export const TEMPLATE_STYLES: Record<string, string> = {
  gradient: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white',
  minimal: 'bg-white border-2 border-slate-900 text-slate-900',
  bold: 'bg-black text-white border-4 border-yellow-400',
  neon: 'bg-slate-900 text-cyan-400 border border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.3)]',
};
