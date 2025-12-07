
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Form, Submission } from '../types';
import { MOCK_FORMS } from '../constants';

// This service handles switching between Real Supabase and Mock Data
// based on configuration.

export const db = {
    forms: {
        list: async (userId: string): Promise<Form[]> => {
            if (!isSupabaseConfigured || !supabase) {
                // Return local mock data + any stored in localStorage for demo
                const localForms = localStorage.getItem('wf_local_forms');
                const parsedLocal = localForms ? JSON.parse(localForms) : [];
                return [...MOCK_FORMS, ...parsedLocal];
            }

            const { data, error } = await supabase
                .from('forms')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            // Map DB structure to Frontend structure if needed
            // (Assuming DB uses snake_case and we use camelCase in some places, 
            // but for now our types align mostly well except created_at)
            return data.map((f: any) => ({
                ...f,
                storyConfig: f.story_config, // map snake_case from DB to camelCase
            })) as Form[];
        },

        get: async (id: string): Promise<Form | null> => {
            if (!isSupabaseConfigured || !supabase) {
                const localForms = localStorage.getItem('wf_local_forms');
                const parsedLocal = localForms ? JSON.parse(localForms) : [];
                const all = [...MOCK_FORMS, ...parsedLocal];
                return all.find(f => f.id === id) || null;
            }

            const { data, error } = await supabase
                .from('forms')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) return null;
            
            return {
                ...data,
                storyConfig: data.story_config
            } as Form;
        },

        create: async (form: Omit<Form, 'id'>, userId: string): Promise<Form> => {
            if (!isSupabaseConfigured || !supabase) {
                const newForm = { ...form, id: `f${Date.now()}` } as Form;
                const localForms = localStorage.getItem('wf_local_forms');
                const parsedLocal = localForms ? JSON.parse(localForms) : [];
                localStorage.setItem('wf_local_forms', JSON.stringify([...parsedLocal, newForm]));
                return newForm;
            }

            const { data, error } = await supabase
                .from('forms')
                .insert({
                    user_id: userId,
                    title: form.title,
                    description: form.description,
                    status: form.status,
                    fields: form.fields,
                    story_config: form.storyConfig,
                    stats: form.stats
                })
                .select()
                .single();

            if (error) throw error;
            return {
                ...data,
                storyConfig: data.story_config
            } as Form;
        },

        update: async (id: string, updates: Partial<Form>) => {
             if (!isSupabaseConfigured || !supabase) {
                // Mock update
                return;
            }

            // Transform back to DB format if needed
            const dbUpdates: any = { ...updates };
            if (updates.storyConfig) {
                dbUpdates.story_config = updates.storyConfig;
                delete dbUpdates.storyConfig;
            }

            const { error } = await supabase
                .from('forms')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;
        }
    },
    
    submissions: {
        create: async (formId: string, submissionData: Record<string, any>) => {
             if (!isSupabaseConfigured || !supabase) {
                console.log("Mock submission:", submissionData);
                return { id: 'mock-sub-id' };
            }

            const { data, error } = await supabase
                .from('submissions')
                .insert({
                    form_id: formId,
                    data: submissionData
                })
                .select()
                .single();
            
            if (error) throw error;
            return data;
        }
    }
};
