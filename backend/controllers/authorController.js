const Author = require('../models/Author');
const User = require('../models/User');

const applyForAuthor = async (req, res) => {
    try {
        const { userId } = req.user;
        const { penName, bio } = req.body;

        if (!userId || !penName || !bio) {
            return res.status(400).json({ msg: "Vui lòng nhập đầy đủ bút danh và giới thiệu bản thân." });
        }

        // Check if user exists and is not already an author
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "Không tìm thấy người dùng." });
        }

        if (user.role === "author") {
            return res.status(400).json({ msg: "Người dùng đã là tác giả." });
        }

        // Check if penName is already taken
        const existingAuthor = await Author.findOne({ penName });
        if (existingAuthor) {
            return res.status(400).json({ msg: "Bút danh này đã được sử dụng." });
        }

        // Create new author
        const newAuthor = new Author({
            user: userId,
            penName,
            bio,
            novels: []
        });

        // Save the author
        await newAuthor.save();

        // Update user role
        user.role = "author";
        await user.save();

        // Populate user info before sending response
        await newAuthor.populate('user', '-password');

        return res.status(200).json({ 
            msg: "Bạn đã đăng ký làm tác giả thành công.", 
            author: newAuthor 
        });
    } catch (error) {
        console.error('Apply for author error:', error);
        return res.status(500).json({ msg: "Lỗi máy chủ nội bộ" });
    }
};

const getAuthors = async (req, res) => {
    try {
        const authors = await Author.find()
            .populate('user', '-password')
            .populate('novels', 'title description');
            
        return res.status(200).json(authors);
    } catch (error) {
        console.error('Get authors error:', error);
        return res.status(500).json({ msg: "Không thể lấy danh sách tác giả" });
    }
};

const getAuthorById = async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
            .populate('user', '-password')
            .populate('novels', 'title description');

        if (!author) {
            return res.status(404).json({ msg: "Không tìm thấy tác giả" });
        }

        return res.status(200).json(author);
    } catch (error) {
        console.error('Get author by ID error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID tác giả không hợp lệ' });
        }
        return res.status(500).json({ msg: "Không thể lấy thông tin tác giả" });
    }
};

const getAuthorByUserId = async (req, res) => {
    try {
        const { userId } = req.user;
        const author = await Author.findOne({ user: userId })
            .populate('user', '-password')
            .populate('novels', 'title description');

        if (!author) {
            return res.status(404).json({ msg: "Không tìm thấy tác giả" });
        }

        return res.status(200).json(author);
    } catch (error) {
        console.error('Get author by user ID error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID người dùng không hợp lệ' });
        }
        return res.status(500).json({ msg: "Không thể lấy thông tin tác giả" });
    }
};

module.exports = {
    applyForAuthor,
    getAuthors,
    getAuthorById,
    getAuthorByUserId
};
