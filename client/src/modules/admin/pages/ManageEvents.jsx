import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X, Save, Loader2, Calendar, Users } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../../../context/AuthContext';

const API_BASE = 'http://localhost:5000/api/events';

const ManageEvents = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { token } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '', description: '', startDate: '', endDate: '', prizePool: '$0',
        venue: 'Online', organizer: 'EduHackTech', status: 'draft', maxTeams: 100, tags: '', thumbnail: '',
        registrationFee: 0, rules: ''
    });

    // Fetch events
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/admin/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setEvents(data.data);
        } catch (err) {
            console.error('Failed to fetch events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openModal = (event = null) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                title: event.title, description: event.description,
                startDate: event.startDate?.split('T')[0] || '', endDate: event.endDate?.split('T')[0] || '',
                prizePool: event.prizePool, venue: event.venue, organizer: event.organizer,
                status: event.status, maxTeams: event.maxTeams, tags: event.tags?.join(', ') || '', thumbnail: event.thumbnail || '',
                registrationFee: event.registrationFee || 0, rules: event.rules || ''
            });
        } else {
            setEditingEvent(null);
            setFormData({ title: '', description: '', startDate: '', endDate: '', prizePool: '$0', venue: 'Online', organizer: 'EduHackTech', status: 'draft', maxTeams: 100, tags: '', thumbnail: '', registrationFee: 0, rules: '' });
        }
        setIsModalOpen(true);
    };

    const saveEvent = async (e) => {
        e.preventDefault();
        const body = { ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) };
        const url = editingEvent ? `${API_BASE}/${editingEvent._id}` : `${API_BASE}`;
        const method = editingEvent ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchEvents();
            } else {
                alert(data.message || 'Error saving event');
            }
        } catch (err) {
            console.error(err);
            alert(`Failed to save event: ${err.message}`);
        }
    };


    const deleteEvent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) fetchEvents();
        } catch (err) {
            alert('Failed to delete event');
        }
    };

    const filteredEvents = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

    const getStatusColor = (status) => {
        switch (status) {
            case 'live': return 'bg-red-500/20 text-red-400';
            case 'upcoming': return 'bg-blue-500/20 text-blue-400';
            case 'past': return 'bg-slate-500/20 text-slate-400';
            default: return 'bg-yellow-500/20 text-yellow-400';
        }
    };

    const [viewingRegistrations, setViewingRegistrations] = useState(null);
    const [registrations, setRegistrations] = useState([]);

    const fetchRegistrations = async (eventId) => {
        try {
            const res = await fetch(`${API_BASE}/${eventId}/registrations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setRegistrations(data.data);
                setViewingRegistrations(eventId);
            }
        } catch (err) {
            alert('Failed to fetch registrations');
        }
    };

    const cancelRegistration = async (regId) => {
        if (!window.confirm('Are you sure you want to cancel this registration?')) return;
        try {
            const res = await fetch(`${API_BASE}/${viewingRegistrations}/registrations/${regId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                // Refresh registrations
                fetchRegistrations(viewingRegistrations);
                alert('Registration cancelled successfully');
            } else {
                alert(data.message || 'Failed to cancel registration');
            }
        } catch (err) {
            alert('Failed to cancel registration');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
            <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'} p-8`}>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Manage Events</h1>
                        <p className="text-slate-400">Create and manage hackathons and competitions.</p>
                    </div>
                    <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20">
                        <Plus size={18} /> Create Event
                    </button>
                </div>

                <div className="relative max-w-md mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">No events found. Click "Create Event" to add one.</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-800/50 text-left text-sm text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Dates</th>
                                    <th className="px-6 py-4">Prize</th>
                                    <th className="px-6 py-4">Entry Fee</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredEvents.map(event => (
                                    <tr key={event._id} className="hover:bg-slate-800/30 transition">
                                        <td className="px-6 py-4 font-medium text-white">{event.title}</td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-emerald-400 font-semibold">{event.prizePool}</td>
                                        <td className="px-6 py-4">
                                            {event.registrationFee > 0 ? (
                                                <span className="text-yellow-400 font-semibold">₹{event.registrationFee}</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">FREE</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(event.status)}`}>{event.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => fetchRegistrations(event._id)} className="p-2 mr-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition" title="View Registrations"><Users size={16} /></button>
                                            <button onClick={() => openModal(event)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"><Pencil size={16} /></button>
                                            <button onClick={() => deleteEvent(event._id)} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-800">
                            <h2 className="text-xl font-bold text-white">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg"><X size={20} /></button>
                        </div>
                        <form onSubmit={saveEvent} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Title *</label>
                                <input name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Description *</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Banner URL</label>
                                <input name="thumbnail" value={formData.thumbnail} onChange={handleChange} placeholder="https://..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Start Date *</label>
                                    <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">End Date *</label>
                                    <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Prize Pool</label>
                                    <input name="prizePool" value={formData.prizePool} onChange={handleChange} placeholder="$10,000" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Max Teams</label>
                                    <input name="maxTeams" type="number" value={formData.maxTeams} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Venue</label>
                                    <input name="venue" value={formData.venue} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Organizer</label>
                                    <input name="organizer" value={formData.organizer} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Tags (comma separated)</label>
                                <input name="tags" value={formData.tags} onChange={handleChange} placeholder="AI, Blockchain, Healthcare" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Registration Fee (₹)</label>
                                    <input name="registrationFee" type="number" min="0" value={formData.registrationFee} onChange={handleChange} placeholder="0 for free" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                                    <p className="text-xs text-slate-500 mt-1">Set to 0 for free events</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500">
                                        <option value="draft">Draft</option>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="live">Live</option>
                                        <option value="past">Past</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Rules & Guidelines</label>
                                <textarea name="rules" value={formData.rules} onChange={handleChange} rows={4} placeholder="Code of conduct, submission guidelines, restrictions..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition">Cancel</button>
                                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition">
                                    <Save size={18} /> {editingEvent ? 'Update' : 'Create'} Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Registrations Modal */}
            {viewingRegistrations && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-800">
                            <h2 className="text-xl font-bold text-white">Event Registrations</h2>
                            <button onClick={() => setViewingRegistrations(null)} className="p-2 hover:bg-slate-800 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            {registrations.length === 0 ? (
                                <p className="text-slate-400 text-center">No registrations yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {registrations.map(reg => (
                                        <div key={reg._id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-white">{reg.teamName || 'Individual'}</h4>
                                                <p className="text-sm text-slate-400">User: {reg.user?.name || 'Unknown'} ({reg.user?.email})</p>
                                                <p className="text-xs text-slate-500">Registered: {new Date(reg.registeredAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full uppercase">{reg.status}</span>
                                                <button
                                                    onClick={() => cancelRegistration(reg._id)}
                                                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-lg transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageEvents;
