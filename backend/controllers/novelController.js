const Novel = require('../models/Novel');
const Author = require('../models/Author');
const Chapter = require('../models/Chapter');
const Review = require('../models/Review');
const User = require('../models/User');
const escapeRegex = require('../utils/escapeRegex');
const { toggleDocumentLike } = require('../utils/likeHelper');

// Helper to populate default novel fields
const defaultNovelPopulate = (query) => {
    return query
        .populate('author', '-user.password')
        .populate('chapters', 'chapterNumber chapterName')
        .populate({
            path: 'reviews',
            select: 'reviewTitle reviewContent likes',
            populate: {
                path: 'user',
                select: '-password'
            }
        });
};

const createNovel = async (req, res) => {
    try {
        const { title, description, authorId, introVideo } = req.body;

        if (!title || !description || !authorId) {
            return res.status(400).json({ msg: "Vui lòng nhập đầy đủ tiêu đề, mô tả và mã tác giả" });
        }

        if (!req.files || !req.files.coverPhoto) {
            return res.status(400).json({ msg: "Vui lòng tải lên ảnh bìa" });
        }

        const author = await Author.findById(authorId);
        if (!author) {
            return res.status(404).json({ msg: "Không tìm thấy tác giả" });
        }

        const novel = new Novel({
            title,
            description,
            coverPhoto: {
                url: req.files.coverPhoto[0].path,
                publicId: req.files.coverPhoto[0].filename
            },
            introVideo: req.files.introVideo ? {
                url: req.files.introVideo[0].path,
                publicId: req.files.introVideo[0].filename
            } : introVideo ? {
                url: introVideo,
                publicId: null
            } : null,
            author: authorId,
            likes: [],
            chapters: [],
            reviews: []
        });

        await novel.save();

        author.novels.push(novel._id);
        await author.save();

        await novel.populate('author', '-user.password');

        return res.status(201).json(novel);
    } catch (error) {
        console.error('Create novel error:', error);
        return res.status(500).json({ msg: "Không thể tạo truyện mới" });
    }
};

// Get all novels with populated data
const getAllNovels = async (req, res) => {
    try {
        const novels = await defaultNovelPopulate(Novel.find())
            .sort({ createdAt: -1 });

        return res.status(200).json(novels);
    } catch (error) {
        console.error('Get all novels error:', error);
        return res.status(500).json({ msg: 'Không thể lấy danh sách truyện' });
    }
};

// Get a specific novel by ID
const getNovelById = async (req, res) => {
    try {
        const novel = await defaultNovelPopulate(Novel.findById(req.params.id));

        if (!novel) {
            return res.status(404).json({ msg: "Không tìm thấy truyện" });
        }

        return res.status(200).json(novel);
    } catch (error) {
        console.error('Get novel by ID error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID truyện không hợp lệ' });
        }
        return res.status(500).json({ msg: "Không thể lấy thông tin truyện" });
    }
};

// Get all novels by an author
const getNovelsByAuthor = async (req, res) => {
    try {
        const novels = await defaultNovelPopulate(Novel.find({ author: req.params.authorId }))
            .sort({ createdAt: -1 });

        return res.status(200).json(novels);
    } catch (error) {
        console.error('Get novels by author error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID tác giả không hợp lệ' });
        }
        return res.status(500).json({ msg: "Không thể lấy danh sách truyện của tác giả" });
    }
};

// Update a novel
const updateNovel = async (req, res) => {
    try {
        const { title, description } = req.body;
        const novelId = req.params.id;

        const novel = await Novel.findById(novelId);
        if (!novel) {
            return res.status(404).json({ msg: "Không tìm thấy truyện" });
        }

        // Update fields if provided
        if (title) novel.title = title;
        if (description) novel.description = description;
        if (req.files?.coverPhoto) {
            novel.coverPhoto = {
                url: req.files.coverPhoto[0].path,
                publicId: req.files.coverPhoto[0].filename
            };
        }
        if (req.files?.introVideo) {
            novel.introVideo = {
                url: req.files.introVideo[0].path,
                publicId: req.files.introVideo[0].filename
            };
        }

        await novel.save();

        // Populate related data before sending response
        await defaultNovelPopulate(novel);

        return res.status(200).json(novel);
    } catch (error) {
        console.error('Update novel error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID truyện không hợp lệ' });
        }
        return res.status(500).json({ msg: "Không thể cập nhật truyện" });
    }
};

// Delete a novel
const deleteNovel = async (req, res) => {
    try {
        const novelId = req.params.id;
        const novel = await Novel.findById(novelId);
        if (!novel) {
            return res.status(404).json({ msg: "Không tìm thấy truyện" });
        }

        // Clean up orphan references
        // 1. Find all reviews of this novel and remove references from User.reviews
        const reviewsToDelete = await Review.find({ novel: novel._id }, '_id');
        const reviewIds = reviewsToDelete.map(r => r._id);
        if (reviewIds.length > 0) {
            await User.updateMany(
                { reviews: { $in: reviewIds } },
                { $pull: { reviews: { $in: reviewIds } } }
            );
            await Review.deleteMany({ novel: novel._id });
        }

        // 2. Remove novel reference from User.likedNovels
        await User.updateMany(
            { likedNovels: novel._id },
            { $pull: { likedNovels: novel._id } }
        );

        // 3. Delete chapters associated with novel
        await Chapter.deleteMany({ novel: novel._id });

        // 4. Remove novel from author's novels
        if (novel.author) {
            await Author.findByIdAndUpdate(novel.author, {
                $pull: { novels: novel._id }
            });
        }

        // 5. Delete novel
        await novel.deleteOne();

        return res.status(200).json({ msg: "Xóa truyện thành công" });
    } catch (error) {
        console.error('Delete novel error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID truyện không hợp lệ' });
        }
        return res.status(500).json({ msg: "Không thể xóa truyện" });
    }
};

// Toggle like on a novel
const toggleNovelLike = async (req, res) => {
    try {
        const { userId } = req.user;
        const { novelId } = req.params;
        if (!userId) {
            return res.status(400).json({ msg: "Yêu cầu có mã người dùng" });
        }

        const result = await toggleDocumentLike(Novel, novelId, userId, { field: 'likedNovels' });
        if (result.status !== 200) {
            return res.status(result.status).json({ msg: result.msg });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        console.error('Toggle novel like error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID không hợp lệ' });
        }
        return res.status(500).json({ msg: "Không thể thích truyện" });
    }
};

// Search novels
const searchNovels = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 3) {
            return res.status(400).json({ msg: "Từ khóa tìm kiếm phải có ít nhất 3 ký tự" });
        }

        // Use a safe regular expression for case-insensitive partial matching
        const safeQuery = escapeRegex(query);
        const regex = new RegExp(safeQuery, 'i');

        const novels = await Novel.find(
            { title: { $regex: regex } }
        )
            .populate('author', '-user.password')
            .populate('chapters', 'chapterNumber chapterName')
            .limit(20);

        return res.status(200).json(novels);
    } catch (error) {
        console.error('Search novels error:', error);
        return res.status(500).json({ msg: "Không thể tìm kiếm truyện" });
    }
};

module.exports = {
    createNovel,
    getAllNovels,
    getNovelById,
    getNovelsByAuthor,
    updateNovel,
    deleteNovel,
    toggleNovelLike,
    searchNovels
};