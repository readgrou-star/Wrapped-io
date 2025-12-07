import React from 'react';
import { StoryConfig, FormField } from '../types';
import { TEMPLATE_STYLES } from '../constants';
import { Sparkles, Calendar } from 'lucide-react';

interface StoryPreviewProps {
  config: StoryConfig;
  data?: Record<string, any>;
  fields?: FormField[];
  className?: string;
}

export const StoryPreview: React.FC<StoryPreviewProps> = ({ config, data, fields, className = '' }) => {
  const baseClasses = "relative w-full aspect-[9/16] rounded-xl overflow-hidden flex flex-col items-center justify-between p-8 transition-all duration-300";
  const themeClasses = TEMPLATE_STYLES[config.template] || TEMPLATE_STYLES.gradient;
  
  const name = data && fields ? 
    fields.find(f => f.id === 'name' || f.label.toLowerCase().includes('name')) ? 
      data[fields.find(f => f.id === 'name' || f.label.toLowerCase().includes('name'))?.id || ''] : 'Participant' 
    : 'Alex Chen';

  const storyFields = fields?.filter(f => f.showInStory && f.id !== 'name' && !f.label.toLowerCase().includes('name')) || [];

  return (
    <div className={`${baseClasses} ${themeClasses} ${className}`}>
        {/* Header */}
        <div className="z-10 w-full text-center mt-8">
            <Sparkles className="w-6 h-6 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2 drop-shadow-sm stack-sans-headline">
                {config.primaryText}
            </h1>
        </div>

        {/* Core Content */}
        <div className="z-10 flex flex-col items-center gap-5 w-full">
             {config.showParticipantName && (
                <div className="text-center w-full">
                    <p className="text-[10px] uppercase tracking-widest opacity-80 mb-2 font-bold">Participant</p>
                    <h2 className="text-2xl font-black truncate leading-tight stack-sans-headline">{name}</h2>
                </div>
            )}

            {data && storyFields.map(field => (
                <div key={field.id} className="text-center">
                    <p className="text-[10px] opacity-80 mb-1 font-bold uppercase tracking-wide">{field.label}</p>
                    <p className="text-xl font-bold stack-sans-headline">{data[field.id]?.toString()}</p>
                </div>
            ))}
            
            {!data && (
                <div className="text-center opacity-60 border border-dashed border-current p-4 rounded-lg w-full">
                    <p className="text-xs font-bold">Fields appear here</p>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="z-10 w-full text-center mb-4">
            <p className="text-lg font-bold mb-4 leading-tight stack-sans-headline">{config.secondaryText}</p>
            
            <div className="flex items-center justify-center gap-4 text-xs opacity-90 font-medium">
                {config.showDate && (
                    <div className="flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                )}
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 opacity-80">
                <div className="w-5 h-5 rounded bg-current flex items-center justify-center font-bold text-[8px] text-white/90">W</div>
                <span className="text-[10px] font-bold tracking-wider uppercase">WrappedForm</span>
            </div>
        </div>
    </div>
  );
};