import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus, Trash2, Save, GripVertical, ChevronDown, ChevronRight,
    Video, FileText, ArrowLeft, Loader2, PlayCircle
} from 'lucide-react';
import { getCourseContent, updateCourseContent, getCourse } from '../../../services/course.service';
import { useAuth } from '../../../context/AuthContext';

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedModules, setExpandedModules] = useState({});

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [courseData, contentData] = await Promise.all([
                getCourse(id),
                getCourseContent(id)
            ]);
            setCourse(courseData);
            if (contentData && contentData.modules) {
                setModules(contentData.modules);
                // Expand all by default
                const expanded = {};
                contentData.modules.forEach((_, i) => expanded[i] = true);
                setExpandedModules(expanded);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateCourseContent(id, { modules }, token);
            alert('Course content saved successfully!');
        } catch (err) {
            alert('Failed to save content');
        } finally {
            setSaving(false);
        }
    };

    const addModule = () => {
        const newModule = { title: 'New Module', lessons: [] };
        setModules([...modules, newModule]);
        setExpandedModules({ ...expandedModules, [modules.length]: true });
    };

    const deleteModule = (index) => {
        if (confirm('Delete this module?')) {
            const newModules = modules.filter((_, i) => i !== index);
            setModules(newModules);
        }
    };

    const updateModuleTitle = (index, title) => {
        const newModules = [...modules];
        newModules[index].title = title;
        setModules(newModules);
    };

    const addLesson = (moduleIndex, type) => {
        const newLesson = {
            title: type === 'video' ? 'New Video Lecture' : 'New Note',
            type,
            content: '',
            duration: 0
        };
        const newModules = [...modules];
        newModules[moduleIndex].lessons.push(newLesson);
        setModules(newModules);
    };

    const updateLesson = (moduleIndex, lessonIndex, field, value) => {
        const newModules = [...modules];
        newModules[moduleIndex].lessons[lessonIndex][field] = value;
        setModules(newModules);
    };

    const deleteLesson = (moduleIndex, lessonIndex) => {
        const newModules = [...modules];
        newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
        setModules(newModules);
    };

    const toggleExpand = (index) => {
        setExpandedModules({ ...expandedModules, [index]: !expandedModules[index] });
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/courses')} className="p-2 hover:bg-slate-100 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                Edit Content: <span className="text-blue-600">{course?.title}</span>
                            </h1>
                            <p className="text-xs text-slate-500">{modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons • {modules.length} Modules</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-70"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">

                {modules.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
                        <p className="text-slate-500 mb-4">Start building your curriculum</p>
                        <button onClick={addModule} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium shadow-sm">
                            + Add First Module
                        </button>
                    </div>
                )}

                <div className="space-y-6">
                    {modules.map((module, mIndex) => (
                        <div key={mIndex} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">

                            {/* Module Header */}
                            <div className="bg-slate-50/80 p-4 flex items-center gap-3 border-b border-slate-100">
                                <button onClick={() => toggleExpand(mIndex)} className="text-slate-400 hover:text-slate-600">
                                    {expandedModules[mIndex] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </button>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={module.title}
                                        onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                                        className="w-full bg-transparent font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
                                        placeholder="Module Title (e.g., Introduction)"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => deleteModule(mIndex)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Lessons List */}
                            {expandedModules[mIndex] && (
                                <div className="p-4 bg-white">
                                    <div className="space-y-4">
                                        {module.lessons.map((lesson, lIndex) => (
                                            <div key={lIndex} className="flex gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/30 group">
                                                <div className="pt-2 text-slate-300">
                                                    <GripVertical size={20} />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-1.5 rounded-lg ${lesson.type === 'video' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                            {lesson.type === 'video' ? <Video size={16} /> : <FileText size={16} />}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={lesson.title}
                                                            onChange={(e) => updateLesson(mIndex, lIndex, 'title', e.target.value)}
                                                            className="flex-1 bg-transparent font-medium text-slate-700 outline-none border-b border-transparent focus:border-blue-200 focus:bg-white px-1 transition"
                                                            placeholder="Lesson Title"
                                                        />
                                                        <button onClick={() => deleteLesson(mIndex, lIndex)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Content Inputs */}
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pl-10">
                                                        <div className="md:col-span-3">
                                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 block">
                                                                {lesson.type === 'video' ? 'Video URL' : 'Content / Description'}
                                                            </label>
                                                            {lesson.type === 'video' ? (
                                                                <input
                                                                    type="text"
                                                                    value={lesson.content}
                                                                    onChange={(e) => updateLesson(mIndex, lIndex, 'content', e.target.value)}
                                                                    placeholder="https://youtube.com/..."
                                                                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
                                                                />
                                                            ) : (
                                                                <textarea
                                                                    value={lesson.content}
                                                                    onChange={(e) => updateLesson(mIndex, lIndex, 'content', e.target.value)}
                                                                    placeholder="Enter text content..."
                                                                    rows={2}
                                                                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                                                                />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 block">Duration (min)</label>
                                                            <input
                                                                type="number"
                                                                value={lesson.duration}
                                                                onChange={(e) => updateLesson(mIndex, lIndex, 'duration', e.target.value)}
                                                                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none"
                                                                min="0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Lesson Buttons */}
                                    <div className="mt-4 flex gap-3 pl-14">
                                        <button
                                            onClick={() => addLesson(mIndex, 'video')}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                                        >
                                            <Video size={14} /> Add Video
                                        </button>
                                        <button
                                            onClick={() => addLesson(mIndex, 'text')}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                                        >
                                            <FileText size={14} /> Add Note
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add Module Button */}
                    <button
                        onClick={addModule}
                        className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 rounded-2xl text-slate-500 hover:text-blue-500 font-medium transition flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> Add New Module
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseEditor;
