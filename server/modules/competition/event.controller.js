const Event = require('./event.model');
const Registration = require('./registration.model');

// @desc    Get all public events (upcoming/live)
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: { $in: ['upcoming', 'live', 'past'] } })
            .populate('createdBy', 'name')
            .sort({ startDate: 1 });
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get all events (Admin - includes drafts)
// @route   GET /api/admin/events
// @access  Private/Admin
exports.getAllEventsAdmin = async (req, res) => {
    try {
        const events = await Event.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name');
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Create new event (Organizer)
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        // Default to 'upcoming' if not specified, or let validating logic handle it
        req.body.status = 'upcoming';

        const event = await Event.create(req.body);
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid data', error: error.message });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer/Admin)
exports.updateEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check ownership or admin
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
        }

        event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Update failed', error: error.message });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer/Admin)
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check ownership or admin
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
        }

        await event.deleteOne();
        res.status(200).json({ success: true, message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Delete failed', error: error.message });
    }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Check if already registered
        const existing = await Registration.findOne({ event: req.params.id, user: req.user.id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already registered' });
        }

        const registration = await Registration.create({
            event: req.params.id,
            user: req.user.id,
            teamName: req.body.teamName || req.user.name
        });

        // Increment count
        event.participantCount = (event.participantCount || 0) + 1;
        await event.save();

        res.status(201).json({ success: true, data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
};

// @desc    Get event registrations
// @route   GET /api/events/:id/registrations
// @access  Private (Organizer/Admin)
exports.getEventRegistrations = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Check auth
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const registrations = await Registration.find({ event: req.params.id }).populate('user', 'name email');
        res.status(200).json({ success: true, data: registrations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fetch failed', error: error.message });
    }
};

// @desc    Check if current user is registered for event
// @route   GET /api/events/:id/check-registration
// @access  Private
exports.checkUserRegistration = async (req, res) => {
    try {
        const registration = await Registration.findOne({
            event: req.params.id,
            user: req.user.id
        });
        res.status(200).json({
            success: true,
            isRegistered: !!registration,
            registration: registration || null
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Check failed', error: error.message });
    }
};

// @desc    Delete/Cancel a registration (Admin/Organizer)
// @route   DELETE /api/events/:id/registrations/:regId
// @access  Private (Admin/Organizer)
exports.deleteRegistration = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Check auth - only admin or event creator can delete registrations
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const registration = await Registration.findById(req.params.regId);
        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        await registration.deleteOne();

        // Decrement participant count
        if (event.participantCount > 0) {
            event.participantCount -= 1;
            await event.save();
        }

        res.status(200).json({ success: true, message: 'Registration cancelled' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Delete failed', error: error.message });
    }
};

// @desc    Get events created by current user (Organizer)
// @route   GET /api/events/my-events
// @access  Private
exports.getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });

        // Get registration counts for each event
        const eventsWithStats = await Promise.all(events.map(async (event) => {
            const registrations = await Registration.find({ event: event._id });
            const pendingCount = registrations.filter(r => r.status === 'pending').length;
            const approvedCount = registrations.filter(r => r.status === 'approved').length;
            const rejectedCount = registrations.filter(r => r.status === 'rejected').length;

            return {
                ...event.toObject(),
                stats: {
                    totalRegistrations: registrations.length,
                    pending: pendingCount,
                    approved: approvedCount,
                    rejected: rejectedCount
                }
            };
        }));

        res.status(200).json({ success: true, count: eventsWithStats.length, data: eventsWithStats });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Update registration status (Organizer/Admin)
// @route   PUT /api/events/:id/registrations/:regId/status
// @access  Private (Organizer/Admin)
exports.updateRegistrationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status. Use: pending, approved, or rejected' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        // Check auth - only admin or event creator can update registration status
        if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const registration = await Registration.findById(req.params.regId);
        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        registration.status = status;
        await registration.save();

        res.status(200).json({ success: true, data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed', error: error.message });
    }
};

// @desc    Get current user's event registrations
// @route   GET /api/events/my-registrations
// @access  Private
exports.getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.user.id })
            .populate('event', 'title thumbnail startDate endDate status prizePool venue registrationFee')
            .sort({ registeredAt: -1 });

        res.status(200).json({ success: true, count: registrations.length, data: registrations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch registrations', error: error.message });
    }
};

// @desc    User unregisters from an event
// @route   DELETE /api/events/:id/unregister
// @access  Private
exports.unregisterFromEvent = async (req, res) => {
    try {
        const registration = await Registration.findOneAndDelete({
            event: req.params.id,
            user: req.user.id
        });

        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        // Decrement participant count
        const event = await Event.findById(req.params.id);
        if (event && event.participantCount > 0) {
            event.participantCount -= 1;
            await event.save();
        }

        res.status(200).json({ success: true, message: 'Successfully unregistered from event' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unregister failed', error: error.message });
    }
};

// @desc    User updates their registration (team name)
// @route   PUT /api/events/:id/my-registration
// @access  Private
exports.updateMyRegistration = async (req, res) => {
    try {
        const { teamName } = req.body;

        const registration = await Registration.findOne({
            event: req.params.id,
            user: req.user.id
        });

        if (!registration) {
            return res.status(404).json({ success: false, message: 'Registration not found' });
        }

        if (teamName !== undefined) {
            registration.teamName = teamName;
        }

        await registration.save();

        res.status(200).json({ success: true, data: registration });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed', error: error.message });
    }
};
