const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { verifyToken } = require('../middleware/verifyToken');
const { validateLogin, validateRegister, validateForgotPassword, validateResetPassword, validateUpdateProfile } = require('../middleware/validation');
const { otpHtmlTemplate } = require('../utils/emailTemplates');
const sendMail = require('../utils/sendMail');
const { client: redisClient } = require('../config/redis');

// const router = express.Router(); // Already declared above - duplicate removed

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW_SECONDS = 15 * 60;

const getLoginAttemptKey = (email) => `login_attempts:${email.toLowerCase()}`;
const getLoginLockKey = (email) => `login_lock:${email.toLowerCase()}`;

const isLockedOut = async (email) => {
  if (!redisClient?.isOpen) return false;
  try {
    const lockValue = await redisClient.get(getLoginLockKey(email));
    return Boolean(lockValue);
  } catch (err) {
    console.warn('Redis lockout check failed:', err.message);
    return false;
  }
};

const recordFailedLogin = async (email) => {
  if (!redisClient?.isOpen) return;
  try {
    const attempts = await redisClient.incr(getLoginAttemptKey(email));
    if (attempts === 1) {
      await redisClient.expire(getLoginAttemptKey(email), LOGIN_ATTEMPT_WINDOW_SECONDS);
    }
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      await redisClient.setex(getLoginLockKey(email), LOGIN_ATTEMPT_WINDOW_SECONDS, '1');
    }
  } catch (err) {
    console.warn('Redis failed login record failed:', err.message);
  }
};

const clearLoginAttempts = async (email) => {
  if (!redisClient?.isOpen) return;
  try {
    await redisClient.del(getLoginAttemptKey(email), getLoginLockKey(email));
  } catch (err) {
    console.warn('Redis clear attempts failed:', err.message);
  }
};

// Google OAuth Client
const googleClientId = process.env.VITE_APP_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
let googleClient = null;
if (googleClientId) {
  googleClient = new OAuth2Client(googleClientId);
}

const router = express.Router();

router.post('/register', validateRegister, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = crypto.randomInt(100000, 999999).toString();
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'student', // Always start as student, role changes after mentor approval
      verified: false,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000
    });

    await user.save();

    const clientUrl = process.env.CLIENT_URL?.replace(/\/$/, '') || 'https://iodlearn.vercel.app';
    const verifyLink = `${clientUrl}/verify`;

    await sendMail({
      to: email,
      subject: 'Verify your email - Iodlearn',
      text: `Your verification code is ${otp}`,
      html: otpHtmlTemplate(otp, name, verifyLink)
    });

    res.status(201).json({ message: 'Registration successful. Check your email for the verification code.' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (await isLockedOut(email)) {
      return res.status(429).json({ message: 'Account temporarily locked. Try again later.' });
    }

    if (!user) {
      await recordFailedLogin(email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.verified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await recordFailedLogin(email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    await clearLoginAttempts(email);

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        username: user.username,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({ message: 'Email verified successfully', token });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendMail({
      to: email,
      subject: 'Resend verification code - Iodlearn',
      text: `Your new verification code is ${otp}`
    });

    res.json({ message: 'Verification code resent' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', validateForgotPassword, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL || 'https://iodlearn.vercel.app'}/reset-password/${resetToken}`;
    await sendMail({
      to: email,
      subject: 'Reset your password - Iodlearn',
      text: `Reset your password using this link: ${resetLink}`
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password/:token', validateResetPassword, async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/update-profile', verifyToken, validateUpdateProfile, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.avatar) updates.avatar = req.body.avatar;
    if (req.body.username) updates.username = req.body.username;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password -otp -otpExpires -resetToken -resetTokenExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth Route
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const googleClientId = process.env.VITE_APP_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(500).json({ message: 'Google OAuth is not configured' });
    }

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(googleClientId);

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId
    });

    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];
    const name = payload['name'] || `${payload['given_name'] || ''} ${payload['family_name'] || ''}`.trim();
    const avatar = payload['picture'];

    // Find or create user
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user with Google info if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = user.avatar || avatar;
        user.isGoogle = true;
      }
      user.verified = true; // Google accounts are considered verified
      await user.save();
    } else {
      // Create new user
      user = new User({
        email,
        name,
        googleId,
        avatar,
        isGoogle: true,
        verified: true,
        role: 'student', // Default role
        password: bcrypt.hashSync(crypto.randomBytes(20).toString('hex'), 12) // Random password
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        username: user.username,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

module.exports = router;