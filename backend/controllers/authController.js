const jwt = require("jsonwebtoken");
const User = require('../models/User');
const secret_key = process.env.jwt_secret;

const signupUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).send("Yêu cầu không hợp lệ. Vui lòng điền đầy đủ thông tin.");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                msg: "Email này đã được đăng ký tài khoản..."
            });
        }

        const newUser = new User({
            name,
            email,
            password,
            role: "user",
            userimage: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'
        });

        await newUser.save();

        const userResponse = newUser.toObject();
        delete userResponse.password;

        return res.status(201).json(userResponse);
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ msg: "Lỗi máy chủ nội bộ" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                msg: "Email không tồn tại trên hệ thống..."
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                msg: "Mật khẩu không chính xác..."
            });
        }

        const token = jwt.sign({ userId: user._id }, secret_key, { expiresIn: '1d' });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        return res.status(200).json({
            msg: "Đăng nhập thành công...",
            token,
            userId: user._id
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ msg: "Lỗi máy chủ nội bộ" });
    }
};

const logoutUser = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    return res.status(200).json({
        msg: "Đăng xuất thành công..."
    });
};

module.exports = {
    signupUser,
    loginUser,
    logoutUser
};