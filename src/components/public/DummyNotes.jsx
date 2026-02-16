import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, MoreVertical, Check, Trash2 } from 'lucide-react';

const DummyNotes = ({ onLock }) => {
    const [notes, setNotes] = useState([
        { id: 1, title: 'Project Alpha', content: 'Meeting with investors at 2 PM. Prepare deck.', date: 'Today' },
        { id: 2, title: 'Grocery List', content: '- Milk\n- Eggs\n- Bread\n- Coffee', date: 'Yesterday' },
        { id: 3, title: 'Gym Routine', content: 'Chest day: Bench press, Incline, Flys.', date: 'Feb 14' }
    ]);
    const [newNote, setNewNote] = useState('');
    const [view, setView] = useState('list'); // list | create

    const addNote = () => {
        if (!newNote.trim()) return;
        const note = {
            id: Date.now(),
            title: newNote.split('\n')[0] || 'New Note',
            content: newNote,
            date: 'Just now'
        };
        setNotes([note, ...notes]);
        setNewNote('');
        setView('list');
    };

    return (
        <div className="bg-white text-black h-[100dvh] flex flex-col font-sans">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                    {view === 'create' ? (
                        <button onClick={() => setView('list')}><ArrowLeft /></button>
                    ) : (
                        <button onClick={onLock} className="text-gray-500"><ArrowLeft /></button>
                    )}
                    <h1 className="text-xl font-bold">My Notes</h1>
                </div>
                <div className="flex gap-4 text-gray-600">
                    <Search size={22} />
                    <MoreVertical size={22} />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {view === 'list' ? (
                    <div className="grid grid-cols-2 gap-3">
                        {notes.map(note => (
                            <div key={note.id} className="bg-yellow-100 p-4 rounded-xl shadow-sm border border-yellow-200 flex flex-col h-40 relative group">
                                <h3 className="font-bold text-gray-800 mb-1 truncate">{note.title}</h3>
                                <p className="text-gray-600 text-sm overflow-hidden flex-1 whitespace-pre-line">{note.content}</p>
                                <span className="text-xs text-gray-400 mt-2">{note.date}</span>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setNotes(notes.filter(n => n.id !== note.id));
                                    }}
                                    className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <textarea
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        placeholder="Type something..."
                        className="w-full h-full text-lg outline-none resize-none p-2 placeholder-gray-400"
                        autoFocus
                    />
                )}
            </div>

            {/* FAB */}
            <div className="absolute bottom-6 right-6">
                {view === 'list' ? (
                    <button
                        onClick={() => setView('create')}
                        className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-transform active:scale-95"
                    >
                        <Plus size={28} />
                    </button>
                ) : (
                    <button
                        onClick={addNote}
                        className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-transform active:scale-95"
                    >
                        <Check size={28} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default DummyNotes;
