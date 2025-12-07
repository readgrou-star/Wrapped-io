
import React from 'react';
import { StoryConfig, FormField } from '../types';

interface StoryPreviewProps {
  config: StoryConfig;
  data?: Record<string, any>; // Form answers
  fields?: FormField[];
  className?: string;
}

export const StoryPreview: React.FC<StoryPreviewProps> = ({ config, data, fields, className = '' }) => {
  
  // Helper to replace {variables} with actual data
  const processContent = (content: string) => {
    if (!content) return '';
    if (!data) return content; // Return raw placeholder if no data

    // Regex to find {Field Label}
    return content.replace(/\{([^}]+)\}/g, (match, key) => {
        // Try to find a field with this label or ID
        const field = fields?.find(f => 
            f.label.toLowerCase() === key.toLowerCase() || 
            f.id === key
        );
        
        if (field && data[field.id]) {
            return data[field.id].toString();
        }
        return match; // Keep placeholder if not found
    });
  };

  return (
    <div 
        className={`relative w-full aspect-[9/16] overflow-hidden shadow-sm transition-all duration-300 ${className}`}
        style={{ background: config.backgroundColor }}
    >
        {config.elements.map(el => {
            const isCenter = el.style.textAlign === 'center';
            const isRight = el.style.textAlign === 'right';
            
            // Calculate Position
            // If centered, x represents the center point. 
            // If left, x represents left edge.
            const style: React.CSSProperties = {
                position: 'absolute',
                top: `${el.y}%`,
                left: `${el.x}%`,
                transform: isCenter ? 'translate(-50%, -50%)' : isRight ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
                color: el.style.color,
                fontSize: el.style.fontSize ? `${el.style.fontSize}px` : undefined, // In a real app we'd scale this based on container width
                fontWeight: el.style.fontWeight,
                textAlign: el.style.textAlign,
                zIndex: el.style.zIndex,
                opacity: el.style.opacity,
                width: el.type === 'shape' ? `${el.width}%` : undefined,
                height: el.type === 'shape' ? `${el.height}%` : undefined,
                backgroundColor: el.style.backgroundColor,
                borderRadius: el.style.borderRadius,
                whiteSpace: 'pre-wrap',
                fontFamily: 'Stack Sans Headline, sans-serif'
            };

            return (
                <div key={el.id} style={style}>
                    {el.type === 'text' && processContent(el.content || '')}
                    {el.type === 'image' && el.content && (
                        <img src={el.content} alt="Story asset" className="w-full h-full object-cover" />
                    )}
                </div>
            );
        })}
    </div>
  );
};
