
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

export const DEFAULT_STORY_CONFIG: StoryConfig = {
    backgroundColor: '#6366F1', // Indigo-500
    elements: [
        {
            id: 'bg-shape-1',
            type: 'shape',
            x: 10, y: 10, width: 80, height: 80,
            style: { backgroundColor: '#ffffff', opacity: 0.1, borderRadius: 50 }
        },
        {
            id: 'title',
            type: 'text',
            content: "YOU'RE IN!",
            x: 50, y: 20,
            style: { color: '#ffffff', fontSize: 32, fontWeight: '900', textAlign: 'center' }
        },
        {
            id: 'participant-label',
            type: 'text',
            content: "PARTICIPANT",
            x: 50, y: 35,
            style: { color: '#ffffff', fontSize: 10, fontWeight: '700', textAlign: 'center', opacity: 0.8 }
        },
        {
            id: 'participant-name',
            type: 'text',
            content: "{Full Name}",
            x: 50, y: 40,
            style: { color: '#ffffff', fontSize: 24, fontWeight: '800', textAlign: 'center' },
            isDynamic: true
        },
        {
            id: 'footer-text',
            type: 'text',
            content: "See you at the bootcamp! 🚀",
            x: 50, y: 70,
            style: { color: '#ffffff', fontSize: 16, fontWeight: '600', textAlign: 'center' }
        },
         {
            id: 'brand',
            type: 'text',
            content: "WRAPPED FORM",
            x: 50, y: 90,
            style: { color: '#ffffff', fontSize: 10, fontWeight: '900', textAlign: 'center', opacity: 0.5 }
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
    storyConfig: DEFAULT_STORY_CONFIG,
    landingConfig: DEFAULT_LANDING_CONFIG
  }
];
