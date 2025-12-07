
import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronUp, ChevronDown, Save, ArrowRight, Smartphone, Monitor, Trash2, PlusCircle, CheckCircle, Plus, X, Layout, Type, List, User, AlignLeft, AlignCenter, AlignRight, Palette, Move, GripVertical } from 'lucide-react';
import { Form, FormField, StoryConfig, StoryTemplate, FieldType, LandingBlock, BlockType, BlockStyle } from '../types';
import { StoryPreview } from '../components/StoryPreview';
import { DEFAULT_STORY_CONFIG, TEMPLATE_STYLES, DEFAULT_LANDING_CONFIG } from '../constants';

const INITIAL_FORM: Form = {
    id: 'new',
    title: 'My Awesome Event',
    description: '',
    status: 'draft',
    created_at: new Date().toISOString(),
    stats: { views: 0, submissions: 0, shares: 0 },
    fields: [
        { id: 'f1', type: 'text', label: 'Full Name', required: true, showInStory: true, placeholder: 'Enter your name' },
        { id: 'f2', type: 'email', label: 'Email', required: true, showInStory: false, placeholder: 'name@example.com' }
    ],
    storyConfig: DEFAULT_STORY_CONFIG,
    landingConfig: DEFAULT_LANDING_CONFIG
};

// --- INLINE EDIT COMPONENT ---
const InlineText = ({ 
    value, 
    onChange, 
    className, 
    tagName = 'div' 
}: { 
    value: string; 
    onChange: (val: string) => void; 
    className?: string; 
    tagName?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
}) => {
    const Tag = tagName as any;
    return (
        <Tag
            contentEditable
            suppressContentEditableWarning
            className={`outline-none border border-transparent hover:border-blue-200 hover:bg-blue-50/10 focus:border-blue-500 rounded px-1 transition-all cursor-text ${className}`}
            onBlur={(e: React.FocusEvent<HTMLElement>) => onChange(e.currentTarget.textContent || '')}
        >
            {value}
        </Tag>
    );
};

export const Builder = () => {
    const navigate = useNavigate();
    const { step = 'build' } = useParams<{ step: string }>(); 
    const [form, setForm] = useState<Form>(INITIAL_FORM);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);

    // --- FORM BUILDER LOGIC ---

    const updateField = (id: string, updates: Partial<FormField>) => {
        setForm(prev => ({
            ...prev,
            fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f)
        }));
    };

    const addField = () => {
        const newField: FormField = {
            id: `f${Date.now()}`,
            type: 'text',
            label: 'New Question',
            required: true,
            showInStory: false
        };
        setForm(prev => ({ ...prev, fields: [...prev.fields, newField] }));
    };

    const removeField = (id: string) => {
        setForm(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== id) }));
    };

    const moveOption = (fieldId: string, index: number, direction: 'up' | 'down') => {
        const field = form.fields.find(f => f.id === fieldId);
        if (!field || !field.options) return;
        
        const newOptions = [...field.options];
        if (direction === 'up' && index > 0) {
            [newOptions[index], newOptions[index - 1]] = [newOptions[index - 1], newOptions[index]];
        } else if (direction === 'down' && index < newOptions.length - 1) {
            [newOptions[index], newOptions[index + 1]] = [newOptions[index + 1], newOptions[index]];
        }
        updateField(fieldId, { options: newOptions });
    };

    // --- LANDING PAGE EDITOR LOGIC ---

    const addBlock = (type: BlockType, index?: number) => {
        const newBlock: LandingBlock = {
            id: `b${Date.now()}`,
            type,
            title: type === 'hero' ? 'Welcome Event' : 'Section Title',
            content: 'Add your content here. Click to edit this text directly.',
            items: type === 'features' ? [{title: 'Feature 1', desc: 'Description'}] : undefined,
            style: {
                backgroundColor: 'bg-white',
                textColor: 'text-slate-900',
                textAlign: 'left',
                padding: 'md'
            }
        };

        setForm(prev => {
            const blocks = [...(prev.landingConfig?.blocks || [])];
            if (index !== undefined) {
                blocks.splice(index, 0, newBlock);
            } else {
                blocks.push(newBlock);
            }
            return {
                ...prev,
                landingConfig: { blocks }
            };
        });
        setSelectedBlockId(newBlock.id);
    };

    const updateBlock = (id: string, updates: Partial<LandingBlock>) => {
        setForm(prev => ({
            ...prev,
            landingConfig: {
                blocks: prev.landingConfig.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
            }
        }));
    };

    const updateBlockStyle = (id: string, styleUpdates: Partial<BlockStyle>) => {
        setForm(prev => ({
            ...prev,
            landingConfig: {
                blocks: prev.landingConfig.blocks.map(b => b.id === id ? { 
                    ...b, 
                    style: { ...b.style, ...styleUpdates } 
                } : b)
            }
        }));
    };

    const removeBlock = (id: string) => {
        setForm(prev => ({
            ...prev,
            landingConfig: {
                blocks: prev.landingConfig.blocks.filter(b => b.id !== id)
            }
        }));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    // DnD Handlers
    const handleDragStart = (e: React.DragEvent, type: BlockType) => {
        e.dataTransfer.setData('blockType', type);
    };

    const handleCanvasDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('blockType') as BlockType;
        if (type) {
            addBlock(type);
        }
    };

    const handleBlockDragStart = (e: React.DragEvent, index: number) => {
        setDraggedBlockIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleBlockDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Handle new block from sidebar
        const type = e.dataTransfer.getData('blockType') as BlockType;
        if (type) {
            addBlock(type, dropIndex);
            return;
        }

        // Handle reordering
        if (draggedBlockIndex !== null && draggedBlockIndex !== dropIndex) {
            const blocks = [...form.landingConfig.blocks];
            const [movedBlock] = blocks.splice(draggedBlockIndex, 1);
            blocks.splice(dropIndex, 0, movedBlock);
            setForm(prev => ({ ...prev, landingConfig: { blocks } }));
        }
        setDraggedBlockIndex(null);
    };

    // --- RENDERERS ---

    const renderBuildStep = () => (
        <div className="flex h-[calc(100vh-60px)] bg-slate-50">
            {/* Sidebar Controls */}
            <div className="w-1/3 min-w-[320px] bg-white border-r border-slate-200 overflow-y-auto p-6 scroll-smooth">
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Form Title</label>
                    <input 
                        type="text" 
                        value={form.title} 
                        onChange={(e) => setForm(p => ({...p, title: e.target.value}))}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:border-slate-900 outline-none transition font-bold text-slate-900 text-sm"
                        placeholder="E.g. Summer Hackathon"
                    />
                </div>

                <div className="space-y-4">
                    {form.fields.map((field, idx) => (
                        <div key={field.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition group shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="w-5 h-5 rounded bg-slate-100 text-[10px] flex items-center justify-center font-bold text-slate-600 border border-slate-200">{idx + 1}</span>
                                    <select 
                                        value={field.type}
                                        onChange={(e) => {
                                            const newType = e.target.value as FieldType;
                                            const updates: Partial<FormField> = { type: newType };
                                            if ((newType === 'select' || newType === 'dropdown') && (!field.options || field.options.length === 0)) {
                                                updates.options = ['Option 1', 'Option 2', 'Option 3'];
                                            }
                                            updateField(field.id, updates);
                                        }}
                                        className="text-[10px] font-bold uppercase bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 cursor-pointer outline-none hover:bg-slate-100"
                                    >
                                        <option value="text">Short Text</option>
                                        <option value="email">Email</option>
                                        <option value="number">Number</option>
                                        <option value="date">Date</option>
                                        <option value="select">Multiple Choice</option>
                                        <option value="dropdown">Dropdown</option>
                                    </select>
                                </div>
                                <button onClick={() => removeField(field.id)} className="text-slate-300 hover:text-red-500 transition">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            
                            <input 
                                type="text" 
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                className="w-full text-sm font-bold bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-900 outline-none py-1 mb-3 text-slate-900"
                                placeholder="Enter your question here"
                            />

                            {(field.type === 'select' || field.type === 'dropdown') && (
                                <div className="mt-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                                        Options
                                    </label>
                                    <div className="space-y-2">
                                        {(field.options || []).map((option, optIdx) => (
                                            <div key={optIdx} className="flex items-center gap-2">
                                                <div className="flex flex-col gap-0.5">
                                                    <button onClick={() => moveOption(field.id, optIdx, 'up')} disabled={optIdx === 0} className="text-slate-300 hover:text-blue-600 disabled:opacity-0"><ChevronUp className="w-3 h-3" /></button>
                                                    <button onClick={() => moveOption(field.id, optIdx, 'down')} disabled={optIdx === (field.options?.length || 0) - 1} className="text-slate-300 hover:text-blue-600 disabled:opacity-0"><ChevronDown className="w-3 h-3" /></button>
                                                </div>
                                                <input 
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [...(field.options || [])];
                                                        newOptions[optIdx] = e.target.value;
                                                        updateField(field.id, { options: newOptions });
                                                    }}
                                                    className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded focus:border-slate-900 outline-none font-medium"
                                                />
                                                <button onClick={() => { const newOptions = field.options?.filter((_, i) => i !== optIdx); updateField(field.id, { options: newOptions }); }} className="text-slate-300 hover:text-red-500"><X className="w-3 h-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => { const newOptions = [...(field.options || []), `New Option`]; updateField(field.id, { options: newOptions }); }}
                                        className="mt-3 text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded w-fit"
                                    >
                                        <Plus className="w-3 h-3" /> Add Option
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={field.required}
                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                        className="rounded text-slate-900 focus:ring-slate-800 w-3.5 h-3.5 border-slate-300"
                                    />
                                    Required
                                </label>
                                <label className="flex items-center gap-2 text-[10px] font-bold text-blue-700 cursor-pointer bg-blue-50 px-2 py-1 rounded border border-blue-100 select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={field.showInStory}
                                        onChange={(e) => updateField(field.id, { showInStory: e.target.checked })}
                                        className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-blue-200"
                                    />
                                    Show in Story
                                </label>
                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={addField}
                        className="w-full py-3 border border-dashed border-slate-300 rounded-lg text-slate-500 font-bold hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2 text-sm"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add Question
                    </button>
                </div>
            </div>

            {/* Live Preview */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
                    <div className="bg-slate-50 border-b border-slate-200 p-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Form Preview
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-center">
                         {form.fields.length > 0 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-lg font-bold text-slate-900 mb-3 stack-sans-headline">
                                        1. {form.fields[0].label} {form.fields[0].required && <span className="text-red-500">*</span>}
                                    </label>
                                    
                                    {form.fields[0].type === 'select' ? (
                                        <div className="space-y-2">
                                            {(form.fields[0].options?.length ? form.fields[0].options : ['Option 1', 'Option 2']).map((opt, i) => (
                                                <div key={i} className="w-full text-left p-3 rounded-lg border border-slate-200 bg-white text-base font-bold text-slate-400">
                                                    {opt || 'Option'}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <input 
                                            disabled 
                                            type={form.fields[0].type} 
                                            placeholder={form.fields[0].placeholder}
                                            className="w-full text-xl bg-transparent border-b border-slate-200 py-2 outline-none font-medium text-slate-400"
                                        />
                                    )}
                                </div>
                                <div className="flex gap-2 mt-8">
                                    <button disabled className="bg-slate-900 text-white px-6 py-2.5 rounded-lg opacity-50 cursor-not-allowed font-bold text-sm flex items-center gap-2">
                                        Next <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLandingStep = () => {
        const blocks = form.landingConfig?.blocks || [];

        return (
            <div className="flex h-[calc(100vh-60px)] bg-slate-50">
                {/* 1. Sidebar - Draggable Widgets */}
                <div className="w-[300px] bg-white border-r border-slate-200 overflow-y-auto p-6 scroll-smooth z-10 flex-shrink-0">
                    <h3 className="font-bold text-slate-900 mb-6 text-lg stack-sans-headline">Drag Elements</h3>
                    <p className="text-xs text-slate-500 mb-4 google-sans-flex">Drag these blocks to the right to build your page.</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {['hero', 'text', 'features', 'speakers'].map((type) => (
                            <div 
                                key={type}
                                draggable
                                onDragStart={(e) => handleDragStart(e, type as BlockType)}
                                className="p-4 border border-slate-200 hover:border-slate-900 hover:bg-slate-50 rounded-xl flex flex-col items-center gap-2 text-xs font-bold transition cursor-grab active:cursor-grabbing bg-white shadow-sm"
                            >
                                {type === 'hero' && <Layout className="w-5 h-5 text-blue-600" />}
                                {type === 'text' && <Type className="w-5 h-5 text-purple-600" />}
                                {type === 'features' && <List className="w-5 h-5 text-green-600" />}
                                {type === 'speakers' && <User className="w-5 h-5 text-orange-600" />}
                                <span className="capitalize">{type}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-2 text-sm">Tips</h4>
                        <ul className="text-xs text-slate-500 list-disc pl-4 space-y-1">
                            <li>Click text on the preview to edit</li>
                            <li>Click a block to customize style</li>
                            <li>Drag blocks to reorder</li>
                        </ul>
                    </div>
                </div>

                {/* 2. Preview Area - 60/40 Split */}
                <div className="flex-1 flex overflow-hidden">
                    {/* 60% Content Area (Drop Zone) */}
                    <div 
                        className="flex-[6] bg-white overflow-y-auto border-r border-slate-200 relative no-scrollbar"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleCanvasDrop}
                    >
                        {blocks.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 pointer-events-none">
                                <PlusCircle className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-bold">Drag blocks here to start building</p>
                            </div>
                        ) : (
                            <div className="min-h-full pb-20">
                                {blocks.map((block, idx) => (
                                    <div 
                                        key={block.id}
                                        draggable
                                        onDragStart={(e) => handleBlockDragStart(e, idx)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => handleBlockDrop(e, idx)}
                                        onClick={() => setSelectedBlockId(block.id)}
                                        className={`
                                            relative group transition-all duration-200
                                            ${block.style?.padding === 'sm' ? 'py-8' : block.style?.padding === 'lg' ? 'py-24' : 'py-16'}
                                            ${block.style?.backgroundColor || 'bg-white'}
                                            ${block.style?.textColor || 'text-slate-900'}
                                            ${block.style?.textAlign === 'center' ? 'text-center' : block.style?.textAlign === 'right' ? 'text-right' : 'text-left'}
                                            ${selectedBlockId === block.id ? 'ring-2 ring-blue-500 ring-inset z-10' : 'hover:ring-1 hover:ring-blue-200 hover:ring-inset'}
                                        `}
                                    >
                                        {/* Block Drag Handle (Hover) */}
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-50 hover:!opacity-100 bg-slate-900 text-white rounded z-20">
                                            <GripVertical className="w-4 h-4" />
                                        </div>

                                        {/* Floating Toolbar (Selected) */}
                                        {selectedBlockId === block.id && (
                                            <div className="absolute top-4 right-4 z-50 flex items-center gap-1 bg-slate-900 text-white p-1.5 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                                                <div className="flex items-center border-r border-white/20 pr-1 mr-1 gap-1">
                                                    <button onClick={(e) => {e.stopPropagation(); updateBlockStyle(block.id, {textAlign: 'left'})}} className={`p-1.5 rounded hover:bg-white/20 ${block.style?.textAlign === 'left' ? 'bg-white/20' : ''}`} title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></button>
                                                    <button onClick={(e) => {e.stopPropagation(); updateBlockStyle(block.id, {textAlign: 'center'})}} className={`p-1.5 rounded hover:bg-white/20 ${block.style?.textAlign === 'center' ? 'bg-white/20' : ''}`} title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></button>
                                                    <button onClick={(e) => {e.stopPropagation(); updateBlockStyle(block.id, {textAlign: 'right'})}} className={`p-1.5 rounded hover:bg-white/20 ${block.style?.textAlign === 'right' ? 'bg-white/20' : ''}`} title="Align Right"><AlignRight className="w-3.5 h-3.5" /></button>
                                                </div>
                                                <div className="flex items-center border-r border-white/20 pr-1 mr-1 gap-1">
                                                    <button onClick={(e) => {e.stopPropagation(); updateBlockStyle(block.id, {backgroundColor: 'bg-white', textColor: 'text-slate-900'})}} className="w-5 h-5 rounded-full bg-white border border-slate-300" title="White Theme"></button>
                                                    <button onClick={(e) => {e.stopPropagation(); updateBlockStyle(block.id, {backgroundColor: 'bg-slate-50', textColor: 'text-slate-900'})}} className="w-5 h-5 rounded-full bg-slate-50 border border-slate-300" title="Gray Theme"></button>
                                                    <button onClick={(e) => {e.stopPropagation(); updateBlockStyle(block.id, {backgroundColor: 'bg-slate-900', textColor: 'text-white'})}} className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700" title="Dark Theme"></button>
                                                </div>
                                                <button onClick={(e) => {e.stopPropagation(); removeBlock(block.id)}} className="p-1.5 hover:bg-red-500/50 hover:text-red-100 rounded text-red-300" title="Delete Block">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                        
                                        <div className="px-12 md:px-16">
                                            {block.type === 'hero' && (
                                                <div>
                                                    <InlineText 
                                                        tagName="h1" 
                                                        className="text-5xl md:text-7xl font-black mb-8 stack-sans-headline leading-[0.95] tracking-tight"
                                                        value={block.title || 'Hero Title'}
                                                        onChange={(val) => updateBlock(block.id, {title: val})}
                                                    />
                                                    <InlineText 
                                                        tagName="p"
                                                        className="text-xl opacity-80 google-sans-flex max-w-2xl leading-relaxed mb-10 mx-auto"
                                                        value={block.content || 'Hero Content'}
                                                        onChange={(val) => updateBlock(block.id, {content: val})}
                                                    />
                                                    <div className="flex justify-center gap-4">
                                                        <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold pointer-events-none">Secure Spot</button>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {block.type === 'text' && (
                                                <div className="max-w-3xl mx-auto">
                                                    <InlineText 
                                                        tagName="h2"
                                                        className="text-3xl font-bold mb-6 stack-sans-headline"
                                                        value={block.title || 'Title'}
                                                        onChange={(val) => updateBlock(block.id, {title: val})}
                                                    />
                                                    <InlineText 
                                                        tagName="p"
                                                        className="text-lg opacity-80 google-sans-flex leading-relaxed"
                                                        value={block.content || 'Content'}
                                                        onChange={(val) => updateBlock(block.id, {content: val})}
                                                    />
                                                </div>
                                            )}

                                            {block.type === 'features' && (
                                                <div>
                                                    <InlineText 
                                                        tagName="h2"
                                                        className="text-3xl font-bold mb-12 stack-sans-headline"
                                                        value={block.title || 'Features'}
                                                        onChange={(val) => updateBlock(block.id, {title: val})}
                                                    />
                                                    <div className="grid grid-cols-3 gap-8 text-left">
                                                        {(block.items || [{title: 'Feature', desc: 'Description'},{title: 'Feature', desc: 'Description'},{title: 'Feature', desc: 'Description'}]).map((item, i) => (
                                                            <div key={i} className="bg-white/5 border border-black/5 p-6 rounded-xl">
                                                                <div className="w-10 h-10 bg-slate-200/50 rounded-lg mb-4 flex items-center justify-center font-bold opacity-50">{i+1}</div>
                                                                <InlineText 
                                                                    tagName="h3"
                                                                    className="font-bold mb-2 text-lg"
                                                                    value={item.title}
                                                                    onChange={(val) => {
                                                                        const newItems = [...(block.items || [])];
                                                                        if(!newItems[i]) newItems[i] = {title:'', desc:''};
                                                                        newItems[i].title = val;
                                                                        updateBlock(block.id, {items: newItems});
                                                                    }}
                                                                />
                                                                <InlineText 
                                                                    tagName="p"
                                                                    className="text-sm opacity-60"
                                                                    value={item.desc}
                                                                    onChange={(val) => {
                                                                        const newItems = [...(block.items || [])];
                                                                        if(!newItems[i]) newItems[i] = {title:'', desc:''};
                                                                        newItems[i].desc = val;
                                                                        updateBlock(block.id, {items: newItems});
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {block.type === 'speakers' && (
                                                <div>
                                                    <InlineText 
                                                        tagName="h2"
                                                        className="text-3xl font-bold mb-12 stack-sans-headline"
                                                        value={block.title || 'Speakers'}
                                                        onChange={(val) => updateBlock(block.id, {title: val})}
                                                    />
                                                    <div className="grid grid-cols-4 gap-4">
                                                        {[1,2,3,4].map(i => (
                                                            <div key={i} className="aspect-square bg-black/5 rounded-xl flex items-center justify-center font-bold text-xs opacity-30 uppercase">
                                                                Speaker Photo
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 40% Form Area */}
                    <div className="flex-[4] bg-slate-50 border-l border-slate-200 relative flex flex-col items-center pt-20 px-6 overflow-hidden">
                        <div className="absolute top-4 right-4 z-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm opacity-50 hover:opacity-100 transition">
                            40% Form Area (Sticky)
                        </div>
                        <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 opacity-75 grayscale hover:grayscale-0 transition duration-500">
                             <div className="h-4 w-1/3 bg-slate-200 rounded mb-6"></div>
                             <div className="h-10 w-full bg-slate-100 rounded mb-4 border border-slate-200"></div>
                             <div className="h-10 w-full bg-slate-100 rounded mb-6 border border-slate-200"></div>
                             <div className="h-10 w-full bg-slate-900 rounded opacity-20"></div>
                             <div className="mt-4 text-center text-xs text-slate-400 font-medium">
                                Form is configured in the "Build" tab
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const renderDesignStep = () => (
        <div className="flex h-[calc(100vh-60px)] bg-slate-50">
             <div className="w-1/3 bg-white border-r border-slate-200 overflow-y-auto p-6">
                <h3 className="font-bold text-slate-900 mb-6 text-lg stack-sans-headline">Story Design</h3>
                
                <div className="mb-8">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 block">Templates</label>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.keys(TEMPLATE_STYLES).map(t => (
                            <button 
                                key={t}
                                onClick={() => setForm(p => ({...p, storyConfig: {...p.storyConfig, template: t as StoryTemplate}}))}
                                className={`h-20 rounded-lg border transition-all capitalize font-bold text-sm ${form.storyConfig.template === t ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Primary Text</label>
                        <input 
                            value={form.storyConfig.primaryText}
                            onChange={(e) => setForm(p => ({...p, storyConfig: {...p.storyConfig, primaryText: e.target.value}}))}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-bold focus:border-slate-900 outline-none text-sm" 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Secondary Text</label>
                        <input 
                            value={form.storyConfig.secondaryText}
                            onChange={(e) => setForm(p => ({...p, storyConfig: {...p.storyConfig, secondaryText: e.target.value}}))}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-bold focus:border-slate-900 outline-none text-sm" 
                        />
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <label className="text-sm font-bold text-slate-700">Show Participant Name</label>
                        <input 
                            type="checkbox"
                            checked={form.storyConfig.showParticipantName}
                            onChange={(e) => setForm(p => ({...p, storyConfig: {...p.storyConfig, showParticipantName: e.target.checked}}))}
                            className="w-4 h-4 text-slate-900 rounded focus:ring-slate-800 border-gray-300"
                        />
                    </div>
                </div>
             </div>

             <div className="flex-1 flex items-center justify-center p-8 bg-slate-100">
                <div className="transform scale-90 md:scale-100 transition-all shadow-xl rounded-xl border border-slate-200 bg-white p-2">
                    <StoryPreview config={form.storyConfig} fields={form.fields} className="w-[320px] rounded-lg" />
                </div>
             </div>
        </div>
    );

    const renderPublishStep = () => (
        <div className="max-w-2xl mx-auto py-16 px-6 text-center">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2 stack-sans-headline">Ready to Launch!</h2>
            <p className="text-slate-500 mb-10 google-sans-flex">Your form is live and ready to go viral.</p>

            <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8 text-left shadow-sm">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Share Link</label>
                <div className="flex gap-2">
                    <input 
                        readOnly
                        value={`https://wrappedform.app/view/demo-form-123`}
                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono text-xs outline-none font-medium"
                    />
                    <button className="bg-slate-900 text-white px-6 rounded-lg font-bold hover:bg-slate-800 transition text-sm">
                        Copy
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => navigate('/view/demo')} className="flex items-center justify-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition font-bold text-slate-700 bg-white text-sm">
                    <Smartphone className="w-5 h-5" />
                    Test on Mobile
                 </button>
                 <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition font-bold text-slate-700 bg-white text-sm">
                    <Monitor className="w-5 h-5" />
                    Go to Dashboard
                 </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-bold text-base text-slate-900 stack-sans-headline">{form.title || 'Untitled Form'}</h1>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                        {step === 'build' ? 'Draft' : 'Saving...'}
                    </span>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
                        {['Landing', 'Build', 'Design', 'Publish'].map((s) => (
                             <button 
                                key={s}
                                onClick={() => navigate(`/builder/${s.toLowerCase()}`)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${step === s.toLowerCase() ? 'bg-white shadow-sm text-slate-900 border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition font-bold text-xs shadow-sm">
                        <Save className="w-3.5 h-3.5" />
                        Save
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                {step === 'landing' && renderLandingStep()}
                {step === 'build' && renderBuildStep()}
                {step === 'design' && renderDesignStep()}
                {step === 'publish' && renderPublishStep()}
            </main>
        </div>
    );
};
