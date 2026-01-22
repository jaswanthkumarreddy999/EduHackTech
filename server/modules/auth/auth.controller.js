// server/modules/auth/auth.controller.js
const User = require('./user.model');
const Otp = require('./otp.model');
const jwt = require('jsonwebtoken');

// @desc    Generate and Send OTP (Logs to Console)
// @route   POST /api/auth/send-otp
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Generate a random 4-digit code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 2. Delete any old OTPs for this email
    await Otp.deleteMany({ email });

    // 3. Save to Database
    await Otp.create({ email, otp: otpCode });

    // 4. LOG TO CONSOLE
    console.log(`\n=============================`);
    console.log(`🔐 OTP for ${email}: ${otpCode}`);
    console.log(`=============================\n`);

    res.json({ success: true, message: 'OTP sent to console' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Check if email exists
// @route   POST /api/auth/check-email
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Login using OTP (No Password)
// @route   POST /api/auth/login-otp
exports.loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Verify OTP
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or Expired OTP' });
    }

    // 2. Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Delete used OTP
    await Otp.deleteMany({ email });

    // 4. Generate Token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Register new user (OTP based)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, otp } = req.body;

    // 1. Verify OTP
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or Expired OTP' });
    }

    // 2. Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Create User (Password is dummy since we use OTP)
    user = await User.create({
      name,
      email,
      password: 'OTP-AUTH-USER',
      role: 'student'
    });

    // 4. Delete used OTP
    await Otp.deleteMany({ email });

    // 5. Generate Token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'avatar', 'bio', 'headline', 'phone',
      'location', 'professional', 'education',
      'skills', 'interests', 'preferredLanguages',
      'learningPreferences', 'socialLinks'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Check if profile is being completed for the first time
    const currentUser = await User.findById(req.user.id);
    if (!currentUser.profileCompletedAt) {
      const tempUser = { ...currentUser.toObject(), ...updates };
      const hasBasicInfo = tempUser.bio && tempUser.headline && tempUser.skills?.length > 0;
      if (hasBasicInfo) {
        updates.profileCompletedAt = Date.now();
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};