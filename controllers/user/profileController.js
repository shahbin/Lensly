// Backend Controller (userController.js)
const User = require('../../models/userSchema');
const bcrypt = require('bcrypt');

// In your userProfile controller
const userProfile = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.redirect('/login');
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.redirect('/login');
        }

        // Add this script tag in your template with the current user data
        const userData = `
            <script>
                const currentUserData = {
                    name: "${user.name}",
                    phone: "${user.phone}"
                };
            </script>
        `;

        res.render('user-profile', { 
            user,
            userData // Pass this to your template
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.redirect('/login');
    }
};

const editProfile = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.json({ 
                success: false, 
                errors: ['Please log in to continue'] 
            });
        }

        const { name, phone } = req.body;

        // Validation
        const errors = [];
        if (!name || !name.trim()) {
            errors.push('Name is required');
        }

        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        const cleanPhone = phone ? phone.replace(/\s+/g, '') : '';
        if (!phoneRegex.test(cleanPhone)) {
            errors.push('Invalid phone number format');
        }

        if (errors.length > 0) {
            return res.json({ success: false, errors });
        }

        // Find and update user
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ 
                success: false, 
                errors: ['User not found'] 
            });
        }

        user.name = name.trim();
        user.phone = cleanPhone;

        await user.save();

        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            user: {
                name: user.name,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.json({ 
            success: false, 
            errors: ['An error occurred while updating profile'] 
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.json({ 
                success: false, 
                errors: ['Please log in to continue'] 
            });
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        // Server-side validation
        const errors = [];

        // Required fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            errors.push('All password fields are required');
        }

        // Password strength validation
        if (newPassword) {
            if (newPassword.length < 8) {
                errors.push('Password must be at least 8 characters long');
            }
            if (!/[A-Za-z]/.test(newPassword)) {
                errors.push('Password must contain at least one letter');
            }
            if (!/\d/.test(newPassword)) {
                errors.push('Password must contain at least one number');
            }
        }

        // Password match validation
        if (newPassword !== confirmPassword) {
            errors.push('New passwords do not match');
        }

        if (errors.length > 0) {
            return res.json({ success: false, errors });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ 
                success: false, 
                errors: ['User not found'] 
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.json({ 
                success: false, 
                errors: ['Current password is incorrect'] 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.json({ 
            success: true, 
            message: 'Password updated successfully' 
        });

    } catch (error) {
        console.error('Error in changePassword:', error);
        res.json({ 
            success: false, 
            errors: ['An error occurred while changing password'] 
        });
    }
};

module.exports = {
    userProfile,
    editProfile,
    changePassword
};