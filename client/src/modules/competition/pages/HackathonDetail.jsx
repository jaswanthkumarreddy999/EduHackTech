import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, Flag, Clock, ArrowLeft, Share2, CheckCircle, Edit, X } from 'lucide-react';
import { getEvent, registerForEvent, updateEvent, checkUserRegistration } from '../../../services/event.service';
import { useAuth } from '../../../context/AuthContext';

const HackathonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    // Populate form when editing starts
    const handleEditClick = () => {
        setEditFormData({
            title: hackathon.title,
            description: hackathon.description,
            rules: hackathon.rules || '',
            startDate: hackathon.startDate ? new Date(hackathon.startDate).toISOString().slice(0, 16) : '',
            endDate: hackathon.endDate ? new Date(hackathon.endDate).toISOString().slice(0, 16) : '',
            prizePool: hackathon.prizePool,
            maxTeams: hackathon.maxTeams,
            venue: hackathon.venue,
            thumbnail: hackathon.thumbnail
        });
        setIsEditing(true);
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updated = await updateEvent(id, editFormData, token);
            setHackathon(updated.data);
            setIsEditing(false);
            alert('Hackathon updated!');
        } catch (error) {
            alert('Update failed: ' + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getEvent(id);
                setHackathon(data);

                // Check if user is already registered
                if (user && token) {
                    try {
                        const regStatus = await checkUserRegistration(id, token);
                        if (regStatus.isRegistered) {
                            setRegistered(true);
                        }
                    } catch (err) {
                        // User not registered or error checking
                        console.log('Registration check:', err);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, user, token]);

    const handleRegister = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        // If paid event, redirect to payment page
        if (hackathon.registrationFee && hackathon.registrationFee > 0) {
            navigate(`/competition/${id}/payment`);
            return;
        }

        // Free event - register directly
        setRegistering(true);
        try {
            await registerForEvent(id, { teamName: teamName || user.name }, token);
            setRegistered(true);
            alert('Successfully registered!');
        } catch (error) {
            alert('Registration failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return <div className="text-white text-center py-20">Loading...</div>;
    if (!hackathon) return <div className="text-white text-center py-20">Hackathon not found</div>;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans pb-20">
            {/* Header / Banner */}
            <div className="relative min-h-[24rem] w-full overflow-hidden">
                {hackathon.thumbnail ? (
                    <img src={hackathon.thumbnail} alt={hackathon.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent"></div>

                {/* Top Bar - Back & Edit buttons */}
                <div className="relative z-20 flex justify-between items-start p-6">
                    <button onClick={() => navigate('/competition')} className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur rounded-full text-white hover:bg-black/60 transition">
                        <ArrowLeft size={18} /> Back to List
                    </button>

                    {user && (user.role === 'admin' || (hackathon.createdBy && user._id === hackathon.createdBy._id)) && (
                        <button onClick={handleEditClick} className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 backdrop-blur rounded-full text-white hover:bg-blue-600 transition shadow-lg">
                            <Edit size={18} /> Edit Event
                        </button>
                    )}
                </div>

                {/* Event Info at Bottom */}
                <div className="relative z-10 p-8 pt-24 max-w-7xl mx-auto">
                    <div className="flex flex-wrap gap-3 mb-4">
                        <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">{hackathon.status}</span>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold">{hackathon.venue || 'Online'}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{hackathon.title}</h1>
                    <p className="text-xl text-slate-300 max-w-3xl">{hackathon.description}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">

                    {/* Rules / Details */}
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Flag className="text-blue-400" /> Challenge Details & Rules
                        </h2>
                        <div className="prose prose-invert max-w-none text-slate-300">
                            <p>{hackathon.rules || "No specific rules provided. Follow standard hackathon code of conduct."}</p>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Clock className="text-green-400" /> Schedule
                        </h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-1 bg-blue-600 rounded-full"></div>
                                <div>
                                    <p className="text-slate-400 text-sm">Start Date</p>
                                    <p className="text-lg font-semibold">{new Date(hackathon.startDate).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-1 bg-purple-600 rounded-full"></div>
                                <div>
                                    <p className="text-slate-400 text-sm">End Date</p>
                                    <p className="text-lg font-semibold">{new Date(hackathon.endDate).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 p-8 rounded-3xl border border-white/10 sticky top-24">
                        <div className="text-center mb-8">
                            <p className="text-slate-300 mb-1">Prize Pool</p>
                            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                {hackathon.prizePool || 'TBD'}
                            </h3>
                        </div>

                        {/* Registration Fee */}
                        <div className="text-center mb-6 pb-6 border-b border-white/10">
                            <p className="text-slate-400 text-sm mb-1">Entry Fee</p>
                            {hackathon.registrationFee && hackathon.registrationFee > 0 ? (
                                <h4 className="text-2xl font-bold text-white">₹{hackathon.registrationFee}</h4>
                            ) : (
                                <span className="px-4 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-full">FREE</span>
                            )}
                        </div>

                        {!registered ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase ml-1 block mb-2">Team Name (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. Code Ninjas"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleRegister}
                                    disabled={registering}
                                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2"
                                >
                                    {registering ? 'Processing...' : (
                                        hackathon.registrationFee && hackathon.registrationFee > 0
                                            ? `Pay ₹${hackathon.registrationFee} & Register`
                                            : 'Register Now'
                                    )}
                                </button>
                                <p className="text-xs text-center text-slate-400">By registering, you agree to the rules.</p>
                            </div>
                        ) : (
                            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
                                <CheckCircle className="mx-auto text-green-400 mb-2" size={32} />
                                <h4 className="font-bold text-green-100">You are registered!</h4>
                                <p className="text-sm text-green-200/70 mt-1">Check your email for details.</p>
                            </div>
                        )}

                        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{hackathon.participantCount || 0}</p>
                                <p className="text-xs text-slate-400">Participants</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{hackathon.maxTeams || 'Unlim'}</p>
                                <p className="text-xs text-slate-400">Team Limit</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Edit Event</h2>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-800 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editFormData.title}
                                    onChange={handleEditChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Challenge Details</label>
                                <textarea
                                    name="description"
                                    rows={5}
                                    value={editFormData.description}
                                    onChange={handleEditChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Rules & Guidelines</label>
                                <textarea
                                    name="rules"
                                    rows={5}
                                    value={editFormData.rules}
                                    onChange={handleEditChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        value={editFormData.startDate}
                                        onChange={handleEditChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">End Date</label>
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={editFormData.endDate}
                                        onChange={handleEditChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg hover:bg-slate-800 transition">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HackathonDetail;
