
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronUp, ChevronDown, Save, ArrowRight, Trash2, PlusCircle, Plus, X, Layout, Type, List, User, AlignLeft, AlignCenter, AlignRight, Check, ChevronDown as ChevronDownIcon, Palette, Image as ImageIcon, Box, Move, Monitor, Smartphone, Wand2, Settings, MousePointer2 } from 'lucide-react';
import { Form, FormField, FieldType, LandingBlock, BlockType, BlockStyle, StoryConfig, StoryElement, FormStyle } from '../types';
import { DEFAULT_STORY_CONFIG, DEFAULT_LANDING_CONFIG } from '../constants';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { StoryPreview } from '../components/StoryPreview';

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
            className={`outline-none border border-transparent hover:border-blue-300 focus:border-blue-500 rounded px-1 transition-all cursor-text ${className}`}
            onBlur={(e: React.FocusEvent<HTMLElement>) => onChange(e.currentTarget.textContent || '')}
        >
            {value}
        </Tag>
    );
};

export const Builder = () => {
    const navigate = useNavigate();
    const { step = 'build' } = useParams<{ step: string }>(); 
    const { user } = useAuth();
    const [form, setForm] = useState<Form>(INITIAL_FORM);
    
    // Landing Page State
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [selectedFormCard, setSelectedFormCard] = useState(false);
    
    // Drag and Drop State
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [isDraggingBlock, setIsDraggingBlock] = useState(false);
    const dragItemRef = useRef<number | null>(null); // Index of item being dragged
    const dragNodeRef = useRef<EventTarget | null>(null);

    // Story Designer State
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isDraggingElement, setIsDraggingElement] = useState(false);

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

    // --- STORY DESIGNER LOGIC ---

    const addStoryElement = (type: 'text' | 'shape' | 'image') => {
        const newEl: StoryElement = {
            id: `el-${Date.now()}`,
            type,
            x: 50, y: 50, // Center
            content: type === 'text' ? 'New Text' : undefined,
            width: type === 'shape' ? 20 : undefined,
            height: type === 'shape' ? 10 : undefined,
            style: {
                color: '#ffffff',
                backgroundColor: type === 'shape' ? '#ffffff' : undefined,
                fontSize: 20,
                textAlign: 'center',
                fontWeight: '700'
            }
        };
        setForm(prev => ({
            ...prev,
            storyConfig: {
                ...prev.storyConfig,
                elements: [...prev.storyConfig.elements, newEl]
            }
        }));
        setSelectedElementId(newEl.id);
    };

    const updateStoryElement = (id: string, updates: Partial<StoryElement> | Partial<StoryElement['style']>) => {
        setForm(prev => ({
            ...prev,
            storyConfig: {
                ...prev.storyConfig,
                elements: prev.storyConfig.elements.map(el => {
                    if (el.id !== id) return el;
                    // Check if updates are style properties
                    const isStyleUpdate = Object.keys(updates).some(k => ['color', 'fontSize', 'backgroundColor', 'textAlign', 'fontWeight'].includes(k));
                    if (isStyleUpdate) {
                        return { ...el, style: { ...el.style, ...updates } };
                    }
                    return { ...el, ...updates };
                })
            }
        }));
    };

    const removeStoryElement = (id: string) => {
         setForm(prev => ({
            ...prev,
            storyConfig: {
                ...prev.storyConfig,
                elements: prev.storyConfig.elements.filter(el => el.id !== id)
            }
        }));
        setSelectedElementId(null);
    };

    // Canvas Drag Logic
    const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedElementId(id);
        setIsDraggingElement(true);
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingElement || !selectedElementId || !canvasRef.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        updateStoryElement(selectedElementId, { x, y });
    };

    const handleCanvasMouseUp = () => {
        setIsDraggingElement(false);
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
            // If dropping, insert at index. If clicking, append.
            if (index !== undefined && index !== null) {
                blocks.splice(index, 0, newBlock);
            } else {
                blocks.push(newBlock);
            }
            return {
                ...prev,
                landingConfig: { ...prev.landingConfig, blocks }
            };
        });
        setSelectedBlockId(newBlock.id);
        setSelectedFormCard(false);
    };

    const updateBlock = (id: string, updates: Partial<LandingBlock>) => {
        setForm(prev => ({
            ...prev,
            landingConfig: {
                ...prev.landingConfig,
                blocks: prev.landingConfig.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
            }
        }));
    };

    const updateBlockStyle = (id: string, styleUpdates: Partial<BlockStyle>) => {
        setForm(prev => ({
            ...prev,
            landingConfig: {
                ...prev.landingConfig,
                blocks: prev.landingConfig.blocks.map(b => b.id === id ? { 
                    ...b, 
                    style: { ...b.style, ...styleUpdates } 
                } : b)
            }
        }));
    };

    const updateFormStyle = (styleUpdates: Partial<FormStyle>) => {
         setForm(prev => ({
            ...prev,
            landingConfig: {
                ...prev.landingConfig,
                formStyle: { ...prev.landingConfig.formStyle, ...styleUpdates } as FormStyle
            }
        }));
    };

    const removeBlock = (id: string) => {
        setForm(prev => ({
            ...prev,
            landingConfig: {
                ...prev.landingConfig,
                blocks: prev.landingConfig.blocks.filter(b => b.id !== id)
            }
        }));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const handleAutoLayout = () => {
        // Automatically optimize padding and alignment for mobile
        setForm(prev => ({
            ...prev,
            landingConfig: {
                ...prev.landingConfig,
                blocks: prev.landingConfig.blocks.map(b => ({
                    ...b,
                    style: {
                        ...b.style,
                        padding: 'sm',
                        textAlign: 'center'
                    }
                }))
            }
        }));
        alert("Auto Layout Applied for Mobile!");
    };

    // --- DRAG AND DROP HANDLERS (CANVA STYLE) ---

    // 1. Sidebar Item Start
    const handleSidebarDragStart = (e: React.DragEvent, type: BlockType) => {
        e.dataTransfer.setData('blockType', type);
        e.dataTransfer.effectAllowed = 'copy';
    };

    // 2. Existing Block Start
    const handleBlockDragStart = (e: React.DragEvent, index: number) => {
        dragItemRef.current = index;
        dragNodeRef.current = e.target;
        e.dataTransfer.effectAllowed = 'move';
        setIsDraggingBlock(true);
        // dataTransfer set to allow drag
        e.dataTransfer.setData('index', index.toString());
        // Transparent drag image
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleDragEnter = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (dragItemRef.current !== index) {
            setDragOverIndex(index);
        }
    };

    const handleCanvasDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);
        setIsDraggingBlock(false);

        const blockType = e.dataTransfer.getData('blockType') as BlockType;

        // Case A: Dropping a new block from Sidebar
        if (blockType) {
            // If dropping on the container (dropIndex -1) or specific index
            const targetIndex = dropIndex === -1 ? form.landingConfig.blocks.length : dropIndex;
            addBlock(blockType, targetIndex);
            return;
        }

        // Case B: Reordering existing block
        const dragIndexStr = e.dataTransfer.getData('index');
        if (dragIndexStr) {
            const dragIndex = parseInt(dragIndexStr);
            if (dragIndex === dropIndex) return;

            const newBlocks = [...form.landingConfig.blocks];
            const [movedBlock] = newBlocks.splice(dragIndex, 1);
            newBlocks.splice(dropIndex, 0, movedBlock);

            setForm(prev => ({
                ...prev,
                landingConfig: { ...prev.landingConfig, blocks: newBlocks }
            }));
        }
        dragItemRef.current = null;
    };


    const handleSave = async () => {
        if (!user) return;
        try {
            if (form.id === 'new') {
                const newForm = await db.forms.create(form, user.id);
                setForm(newForm);
                navigate(`/builder/landing`);
            } else {
                await db.forms.update(form.id, form);
            }
            alert('Saved successfully!');
        } catch (e) {
            alert('Error saving form');
        }
    };

    // --- RENDERERS ---

    const renderBuildStep = () => (
        // ... (Keep existing form builder code exactly as is)
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

    const renderDesignStep = () => {
         // ... (Keep existing story designer code exactly as is)
        const selectedElement = form.storyConfig.elements.find(el => el.id === selectedElementId);

        return (
            <div className="flex h-[calc(100vh-60px)] bg-slate-50">
                {/* 1. Sidebar - Layers and Tools */}
                <div className="w-[300px] bg-white border-r border-slate-200 flex flex-col z-10">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900 text-sm stack-sans-headline mb-4">Add Elements</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => addStoryElement('text')} className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition text-xs font-bold text-slate-600">
                                <Type className="w-5 h-5 mb-1 text-slate-900" />
                                Text
                            </button>
                            <button onClick={() => addStoryElement('shape')} className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition text-xs font-bold text-slate-600">
                                <Box className="w-5 h-5 mb-1 text-slate-900" />
                                Shape
                            </button>
                            <button onClick={() => addStoryElement('image')} className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition text-xs font-bold text-slate-600">
                                <ImageIcon className="w-5 h-5 mb-1 text-slate-900" />
                                Image
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide mb-3">Properties</h3>
                        
                        {selectedElement ? (
                            <div className="space-y-4">
                                {selectedElement.type === 'text' && (
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Content</label>
                                        <textarea 
                                            value={selectedElement.content || ''}
                                            onChange={(e) => updateStoryElement(selectedElement.id, { content: e.target.value })}
                                            className="w-full text-xs p-2 border border-slate-200 rounded focus:border-slate-900 outline-none font-medium"
                                            rows={2}
                                        />
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {form.fields.map(f => (
                                                <button 
                                                    key={f.id}
                                                    onClick={() => updateStoryElement(selectedElement.id, { content: `{${f.label}}` })}
                                                    className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100 hover:bg-blue-100"
                                                >
                                                    Insert {f.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Color</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                value={selectedElement.style.color || '#000000'}
                                                onChange={(e) => updateStoryElement(selectedElement.id, { color: e.target.value })}
                                                className="w-8 h-8 rounded cursor-pointer border-none"
                                            />
                                            <span className="text-xs font-mono">{selectedElement.style.color}</span>
                                        </div>
                                    </div>
                                    {selectedElement.type === 'text' && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Size</label>
                                            <input 
                                                type="number" 
                                                value={selectedElement.style.fontSize}
                                                onChange={(e) => updateStoryElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                                                className="w-full text-xs p-2 border border-slate-200 rounded focus:border-slate-900 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {selectedElement.type === 'shape' && (
                                    <div>
                                         <label className="block text-[10px] font-bold text-slate-500 mb-1">Background</label>
                                         <input 
                                            type="color" 
                                            value={selectedElement.style.backgroundColor || '#ffffff'}
                                            onChange={(e) => updateStoryElement(selectedElement.id, { backgroundColor: e.target.value })}
                                            className="w-full h-8 rounded cursor-pointer"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Align</label>
                                    <div className="flex bg-slate-100 p-1 rounded">
                                        {['left', 'center', 'right'].map((align) => (
                                            <button 
                                                key={align}
                                                onClick={() => updateStoryElement(selectedElement.id, { textAlign: align as any })}
                                                className={`flex-1 p-1 rounded flex justify-center ${selectedElement.style.textAlign === align ? 'bg-white shadow-sm' : 'text-slate-400'}`}
                                            >
                                                {align === 'left' && <AlignLeft className="w-3 h-3" />}
                                                {align === 'center' && <AlignCenter className="w-3 h-3" />}
                                                {align === 'right' && <AlignRight className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => removeStoryElement(selectedElement.id)}
                                    className="w-full mt-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-100"
                                >
                                    <Trash2 className="w-3 h-3" /> Remove Element
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-8">Select an element on the canvas to edit properties</p>
                        )}
                    </div>
                </div>

                {/* 2. Interactive Canvas */}
                <div className="flex-1 flex items-center justify-center bg-slate-100 overflow-hidden relative">
                    <div 
                        className="relative w-[360px] h-[640px] shadow-2xl bg-white overflow-hidden select-none"
                        style={{ backgroundColor: form.storyConfig.backgroundColor }}
                        ref={canvasRef}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                    >
                         {/* Background Color Picker Overlay */}
                         <div className="absolute top-2 right-2 z-50">
                            <input 
                                type="color" 
                                value={form.storyConfig.backgroundColor}
                                onChange={(e) => setForm(p => ({...p, storyConfig: {...p.storyConfig, backgroundColor: e.target.value}}))}
                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm cursor-pointer"
                                title="Background Color"
                            />
                         </div>

                        {/* Elements */}
                        {form.storyConfig.elements.map(el => {
                            const isSelected = selectedElementId === el.id;
                            const isCenter = el.style.textAlign === 'center';
                            const isRight = el.style.textAlign === 'right';

                            return (
                                <div
                                    key={el.id}
                                    onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                                    className={`absolute cursor-move hover:outline hover:outline-1 hover:outline-blue-300 ${isSelected ? 'outline outline-2 outline-blue-600 z-50' : ''}`}
                                    style={{
                                        top: `${el.y}%`,
                                        left: `${el.x}%`,
                                        transform: isCenter ? 'translate(-50%, -50%)' : isRight ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
                                        color: el.style.color,
                                        fontSize: `${el.style.fontSize}px`,
                                        fontWeight: el.style.fontWeight,
                                        textAlign: el.style.textAlign,
                                        fontFamily: 'Stack Sans Headline, sans-serif',
                                        width: el.type === 'shape' ? `${el.width}%` : undefined,
                                        height: el.type === 'shape' ? `${el.height}%` : undefined,
                                        backgroundColor: el.style.backgroundColor,
                                        borderRadius: el.style.borderRadius ? `${el.style.borderRadius}%` : undefined,
                                        opacity: el.style.opacity,
                                        whiteSpace: 'pre-wrap'
                                    }}
                                >
                                    {el.type === 'text' && (el.content || 'Text')}
                                    {el.type === 'image' && <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px]">Image</div>}
                                    
                                    {/* Selection Handles (Visual only for now) */}
                                    {isSelected && (
                                        <>
                                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-600 rounded-full"></div>
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-blue-600 rounded-full"></div>
                                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-blue-600 rounded-full"></div>
                                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-600 rounded-full"></div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderLandingStep = () => {
        const blocks = form.landingConfig?.blocks || [];
        const formStyle = form.landingConfig.formStyle || { shadow: 'xl', borderRadius: 'xl', borderColor: '#e2e8f0', backgroundColor: '#ffffff' };

        return (
            <div className="flex h-[calc(100vh-60px)] bg-slate-50">
                {/* 1. Sidebar - Draggable Widgets */}
                <div className="w-[300px] bg-white border-r border-slate-200 overflow-y-auto p-6 scroll-smooth z-10 flex-shrink-0">
                    
                    {selectedFormCard ? (
                         <div className="animate-in slide-in-from-left-4 fade-in duration-200">
                            <div className="flex items-center gap-2 mb-6">
                                <button onClick={() => setSelectedFormCard(false)} className="text-slate-400 hover:text-slate-600">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <h3 className="font-bold text-slate-900 text-lg stack-sans-headline">Form Card Style</h3>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Shadow</label>
                                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                        {['none', 'sm', 'md', 'xl', '2xl'].map(s => (
                                            <button 
                                                key={s}
                                                onClick={() => updateFormStyle({ shadow: s as any })}
                                                className={`flex-1 py-1 rounded text-[10px] font-bold uppercase ${formStyle.shadow === s ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Roundness</label>
                                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                                        {['sm', 'md', 'lg', 'xl', '2xl', '3xl'].map(r => (
                                            <button 
                                                key={r}
                                                onClick={() => updateFormStyle({ borderRadius: r as any })}
                                                className={`flex-1 py-1 rounded text-[10px] font-bold uppercase ${formStyle.borderRadius === r ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Border Color</label>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="color" 
                                            value={formStyle.borderColor}
                                            onChange={(e) => updateFormStyle({ borderColor: e.target.value })}
                                            className="w-10 h-10 rounded border border-slate-200 cursor-pointer"
                                        />
                                        <span className="text-xs font-mono text-slate-500">{formStyle.borderColor}</span>
                                    </div>
                                </div>
                            </div>
                         </div>
                    ) : (
                        <>
                            <h3 className="font-bold text-slate-900 mb-6 text-lg stack-sans-headline">Drag Components</h3>
                            <p className="text-xs text-slate-500 mb-6 google-sans-flex">Drag these blocks to the right to build your page. Sort and reorder instantly.</p>
                            
                            <div className="space-y-3">
                                {[
                                    {type: 'hero', label: 'Hero Header', icon: Layout, color: 'text-blue-600', bg: 'bg-blue-50'},
                                    {type: 'text', label: 'Text Content', icon: Type, color: 'text-purple-600', bg: 'bg-purple-50'},
                                    {type: 'features', label: 'Feature Grid', icon: List, color: 'text-green-600', bg: 'bg-green-50'},
                                    {type: 'speakers', label: 'Speakers / Team', icon: User, color: 'text-orange-600', bg: 'bg-orange-50'}
                                ].map((item) => (
                                    <div 
                                        key={item.type}
                                        draggable
                                        onDragStart={(e) => handleSidebarDragStart(e, item.type as BlockType)}
                                        className="p-3 border border-slate-200 hover:border-slate-400 rounded-xl flex items-center gap-3 cursor-grab active:cursor-grabbing bg-white shadow-sm transition-all hover:translate-x-1"
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bg}`}>
                                            <item.icon className={`w-5 h-5 ${item.color}`} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-900">{item.label}</div>
                                            <div className="text-[10px] text-slate-400">Drag to canvas</div>
                                        </div>
                                        <div className="ml-auto text-slate-300">
                                            <MousePointer2 className="w-4 h-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-2 text-sm">Editor Tips</h4>
                                <ul className="text-xs text-slate-500 space-y-2">
                                    <li className="flex gap-2">
                                        <div className="w-1 h-1 bg-slate-400 rounded-full mt-1.5"></div>
                                        Drag sections up/down to reorder
                                    </li>
                                    <li className="flex gap-2">
                                        <div className="w-1 h-1 bg-slate-400 rounded-full mt-1.5"></div>
                                        Click text to edit directly
                                    </li>
                                    <li className="flex gap-2">
                                        <div className="w-1 h-1 bg-slate-400 rounded-full mt-1.5"></div>
                                        Select sections to change style
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                {/* 2. Preview Area - 70/30 Split Seamless (With Mobile Switcher) */}
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
                    
                    {/* Viewport Toolbar */}
                    <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-center gap-4">
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setViewMode('desktop')} 
                                className={`p-2 rounded-md transition ${viewMode === 'desktop' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Desktop View"
                            >
                                <Monitor className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('mobile')} 
                                className={`p-2 rounded-md transition ${viewMode === 'mobile' ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Mobile View"
                            >
                                <Smartphone className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {viewMode === 'mobile' && (
                            <button 
                                onClick={handleAutoLayout}
                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-lg text-xs font-bold hover:bg-purple-100 transition animate-in fade-in"
                            >
                                <Wand2 className="w-3.5 h-3.5" /> Auto Layout
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 flex justify-center bg-slate-100 relative">
                        
                        {/* Editor Canvas Container */}
                        <div 
                            className={`transition-all duration-300 bg-slate-50 shadow-sm relative flex flex-col md:flex-row overflow-hidden
                                ${viewMode === 'mobile' ? 'w-[375px] h-[812px] border-[10px] border-slate-900 rounded-[3rem] shadow-2xl mt-4 ring-4 ring-slate-900/20' : 'w-full h-full rounded-none'}
                            `}
                        >
                             {/* 70% Content Area (Canva-like Drop Zone) */}
                            <div 
                                className={`${viewMode === 'mobile' ? 'w-full h-full overflow-y-auto' : 'flex-[7] h-full overflow-y-auto'} no-scrollbar relative`}
                                onDragOver={handleCanvasDragOver}
                                onDrop={(e) => handleDrop(e, -1)}
                            >
                                {/* Fake Nav */}
                                <div className="sticky top-0 z-20 px-8 py-6 flex items-center justify-between mix-blend-multiply pointer-events-none opacity-50">
                                    <div className="font-bold text-xl text-slate-900 stack-sans-headline flex items-center gap-2">
                                        <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm">W</div>
                                        {form.title}
                                    </div>
                                </div>

                                {blocks.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 pointer-events-none p-10 border-2 border-dashed border-slate-200 m-8 rounded-2xl">
                                        <PlusCircle className="w-16 h-16 mb-4 opacity-50" />
                                        <p className="text-lg font-bold">Drag blocks here</p>
                                    </div>
                                ) : (
                                    <div className="min-h-full pb-20 pt-4 px-2">
                                        {blocks.map((block, idx) => (
                                            <React.Fragment key={block.id}>
                                                
                                                {/* Drop Indicator */}
                                                {dragOverIndex === idx && (
                                                    <div className="h-1 bg-blue-500 my-2 rounded-full mx-8 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                                )}

                                                <div 
                                                    draggable
                                                    onDragStart={(e) => handleBlockDragStart(e, idx)}
                                                    onDragOver={(e) => handleDragEnter(e, idx)}
                                                    onDrop={(e) => handleDrop(e, idx)}
                                                    onClick={() => { setSelectedBlockId(block.id); setSelectedFormCard(false); }}
                                                    className={`
                                                        relative group transition-all duration-200 px-6 md:px-10 cursor-move
                                                        rounded-xl border border-transparent
                                                        ${block.style?.padding === 'sm' ? 'py-8' : block.style?.padding === 'lg' ? 'py-24' : 'py-16'}
                                                        ${block.style?.backgroundColor === 'bg-white' ? 'bg-slate-50' : (block.style?.backgroundColor || 'bg-slate-50')}
                                                        ${block.style?.textColor || 'text-slate-900'}
                                                        ${block.style?.textAlign === 'center' ? 'text-center' : block.style?.textAlign === 'right' ? 'text-right' : 'text-left'}
                                                        ${selectedBlockId === block.id ? 'ring-2 ring-blue-500 ring-offset-2 z-10 bg-white shadow-xl' : 'hover:bg-white/50 hover:border-slate-200 hover:shadow-sm'}
                                                    `}
                                                >
                                                    {/* Floating Toolbar (Selected) */}
                                                    {selectedBlockId === block.id && (
                                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-slate-900 text-white p-1.5 rounded-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                                            <div className="flex items-center border-r border-white/20 pr-1 mr-1 gap-1">
                                                                <button onClick={(e) => {e.stopPropagation(); updateBlockStyle(block.id, {textAlign: 'left'})}} className={`p-2 rounded-full hover:bg-white/20 ${block.style?.textAlign === 'left' ? 'bg-white/20' : ''}`} title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></button>
                                                                <button onClick={(e) => {e.stopPropagation(); updateBlockStyle(block.id, {textAlign: 'center'})}} className={`p-2 rounded-full hover:bg-white/20 ${block.style?.textAlign === 'center' ? 'bg-white/20' : ''}`} title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></button>
                                                                <button onClick={(e) => {e.stopPropagation(); updateBlockStyle(block.id, {textAlign: 'right'})}} className={`p-2 rounded-full hover:bg-white/20 ${block.style?.textAlign === 'right' ? 'bg-white/20' : ''}`} title="Align Right"><AlignRight className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button onClick={(e) => {e.stopPropagation(); updateBlockStyle(block.id, {backgroundColor: block.style?.backgroundColor === 'bg-slate-900' ? 'bg-white' : 'bg-slate-900', textColor: block.style?.backgroundColor === 'bg-slate-900' ? 'text-slate-900' : 'text-white'})}} className="p-2 rounded-full hover:bg-white/20" title="Invert Colors"><Palette className="w-3.5 h-3.5" /></button>
                                                                <button onClick={(e) => {e.stopPropagation(); removeBlock(block.id)}} className="p-2 rounded-full hover:bg-red-500 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Block Content Renderers */}
                                                    {block.type === 'hero' && (
                                                        <div className="pointer-events-auto">
                                                            <span className="inline-block px-3 py-1 bg-blue-100/50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 border border-blue-200">Event Registration</span>
                                                            <InlineText tagName="h1" value={block.title || 'Event'} onChange={(v) => updateBlock(block.id, {title: v})} className="text-5xl md:text-8xl font-black mb-8 stack-sans-headline leading-[0.9] tracking-tight" />
                                                            <InlineText tagName="p" value={block.content || 'Desc'} onChange={(v) => updateBlock(block.id, {content: v})} className="text-xl md:text-2xl opacity-70 google-sans-flex max-w-2xl leading-relaxed mb-10 mx-auto font-medium" />
                                                        </div>
                                                    )}
                                                    {block.type === 'text' && (
                                                        <div className="pointer-events-auto max-w-3xl mx-auto">
                                                            <InlineText tagName="h2" value={block.title || 'Title'} onChange={(v) => updateBlock(block.id, {title: v})} className="text-3xl md:text-4xl font-bold mb-6 stack-sans-headline" />
                                                            <InlineText tagName="p" value={block.content || 'Content'} onChange={(v) => updateBlock(block.id, {content: v})} className="text-lg opacity-80 leading-relaxed google-sans-flex" />
                                                        </div>
                                                    )}
                                                    {block.type === 'features' && (
                                                        <div className="pointer-events-auto">
                                                            <InlineText tagName="h2" value={block.title || 'Features'} onChange={(v) => updateBlock(block.id, {title: v})} className="text-3xl md:text-4xl font-bold mb-12 stack-sans-headline" />
                                                            <div className={`grid grid-cols-1 ${viewMode === 'mobile' ? 'gap-4' : 'md:grid-cols-3 gap-6'}`}>
                                                                {(block.items || []).map((item, i) => (
                                                                    <div key={i} className="bg-white p-8 rounded-2xl text-left shadow-sm border border-slate-100">
                                                                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-6 font-bold text-slate-400">{i+1}</div>
                                                                        <InlineText tagName="h3" value={item.title} onChange={(v) => {
                                                                            const newItems = [...(block.items || [])];
                                                                            newItems[i].title = v;
                                                                            updateBlock(block.id, {items: newItems});
                                                                        }} className="font-bold mb-3 text-xl text-slate-900 stack-sans-headline" />
                                                                        <InlineText tagName="p" value={item.desc} onChange={(v) => {
                                                                            const newItems = [...(block.items || [])];
                                                                            newItems[i].desc = v;
                                                                            updateBlock(block.id, {items: newItems});
                                                                        }} className="text-slate-500 text-sm leading-relaxed google-sans-flex" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {block.type === 'speakers' && (
                                                        <div className="pointer-events-auto">
                                                            <InlineText tagName="h2" value={block.title || 'Speakers'} onChange={(v) => updateBlock(block.id, {title: v})} className="text-3xl md:text-4xl font-bold mb-12 stack-sans-headline" />
                                                            <div className={`grid ${viewMode === 'mobile' ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-6'}`}>
                                                                {[1, 2, 3, 4].map((i) => (
                                                                    <div key={i}>
                                                                        <div className="w-full aspect-square bg-white rounded-2xl mb-4 border border-slate-100"></div>
                                                                        <h3 className="font-bold">Speaker {i}</h3>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </React.Fragment>
                                        ))}

                                        {/* Drop Zone at bottom if dragging */}
                                        {isDraggingBlock && (
                                             <div 
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => handleDrop(e, blocks.length)}
                                                className="h-24 m-4 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl flex items-center justify-center text-blue-400 font-bold"
                                             >
                                                Drop to add at bottom
                                             </div>
                                        )}

                                        {/* Mobile View: Render Form at Bottom */}
                                        {viewMode === 'mobile' && (
                                            <div className="p-4 bg-slate-100 mt-8 border-t border-slate-200">
                                                <div 
                                                    className="bg-white p-6 transition-all duration-300 pointer-events-none opacity-80"
                                                    style={{ 
                                                        borderRadius: '1rem', // Simple rounded for mobile simulation
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                >
                                                    <div className="text-center">
                                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Registration Form</p>
                                                        <div className="h-2 w-1/3 bg-slate-100 mx-auto rounded-full mb-4"></div>
                                                        <div className="h-8 w-full bg-slate-100 rounded-lg"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 30% Form Container (Static Floating Card Preview) - ONLY IN DESKTOP */}
                            {viewMode === 'desktop' && (
                                <div className="flex-[3] h-full flex flex-col justify-center px-8 bg-slate-50 border-l border-slate-50/0 pointer-events-none">
                                    <div 
                                        onClick={() => { setSelectedFormCard(true); setSelectedBlockId(null); }}
                                        className={`bg-white p-8 max-h-[85vh] overflow-y-auto no-scrollbar flex flex-col pointer-events-auto transition-all duration-300 cursor-pointer relative group
                                            ${selectedFormCard ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-200'}
                                        `}
                                        style={{ 
                                            boxShadow: formStyle.shadow === 'none' ? 'none' : `var(--tw-shadow-${formStyle.shadow || 'xl'})`,
                                            borderRadius: formStyle.borderRadius === 'none' ? '0px' : formStyle.borderRadius === 'sm' ? '0.125rem' : formStyle.borderRadius === 'md' ? '0.375rem' : formStyle.borderRadius === 'lg' ? '0.5rem' : formStyle.borderRadius === 'xl' ? '0.75rem' : formStyle.borderRadius === '2xl' ? '1rem' : '1.5rem',
                                            borderColor: formStyle.borderColor,
                                            borderWidth: '1px',
                                            backgroundColor: formStyle.backgroundColor
                                        }}
                                    >
                                        {selectedFormCard && (
                                            <div className="absolute top-2 right-2 bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                                                <Settings className="w-3 h-3" /> Editing Style
                                            </div>
                                        )}

                                        {/* Fake Form Content */}
                                        <div className="mb-8">
                                            <div className="flex justify-between items-end mb-3">
                                                <span className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">Step 1 of 3</span>
                                            </div>
                                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-900 w-1/3"></div>
                                            </div>
                                        </div>
                                        <div className="mb-8 flex-1">
                                            <h2 className="text-2xl font-bold text-slate-900 leading-tight stack-sans-headline mb-6">
                                                {form.fields[0]?.label || 'Question'} <span className="text-blue-600">*</span>
                                            </h2>
                                            <div className="w-full text-xl text-slate-900 border-b border-slate-200 py-2 bg-transparent font-bold stack-sans-headline">
                                                {form.fields[0]?.placeholder || 'Answer...'}
                                            </div>
                                        </div>
                                        <button className="w-full bg-slate-900 text-white text-sm font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                                            Next <ArrowRight className="w-4 h-4" />
                                        </button>
                                        <div className="mt-6 text-center">
                                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wide">Secure via WrappedForm</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
            {/* Top Bar */}
            <div className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-slate-200 mx-2"></div>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => navigate('/builder/build')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${step === 'build' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            1. Form
                        </button>
                        <button 
                             onClick={() => navigate('/builder/design')}
                             className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${step === 'design' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            2. Design Story
                        </button>
                        <button 
                            onClick={() => navigate('/builder/landing')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${step === 'landing' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            3. Landing Page
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition">
                        <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {step === 'build' ? renderBuildStep() : step === 'landing' ? renderLandingStep() : renderDesignStep()}
        </div>
    );
};
