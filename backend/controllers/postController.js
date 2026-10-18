const Post = require("../models/Post");
const User = require("../models/User");
const { toggleDocumentLike, toggleSubdocumentLike } = require("../utils/likeHelper");

// Create a new post
const addPosts = async (req, res) => {
    try {
        const { userId } = req.user;
        const { title, content } = req.body;

        if (!title || !content) {
            return res
                .status(400)
                .json({ msg: "Vui lòng nhập đầy đủ tiêu đề và nội dung" });
        }

        if (!req.file) {
            return res.status(400).json({ msg: "Vui lòng chọn tệp hình ảnh" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "Không tìm thấy người dùng" });
        }

        const post = new Post({
            title,
            content,
            image: {
                url: req.file.path,
                publicId: req.file.filename
            },
            user: userId,
            likes: [],
            comments: [],
        });

        // Save the post
        await post.save();

        // Add post reference to user's posts array
        if (!user.posts) user.posts = [];
        user.posts.push(post._id);
        await user.save();

        // Populate user info before sending response
        await post.populate("user", "-password");

        return res.status(201).json(post);
    } catch (error) {
        console.error("Add post error:", error);
        if (error.message.includes('image')) {
            return res.status(400).json({ msg: "Định dạng hoặc dung lượng hình ảnh không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể tạo bài viết" });
    }
};

// Get all posts with populated user and comment data
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "-password")
            .populate("comments.user", "-password")
            .sort({ createdAt: -1 });

        return res.status(200).json(posts);
    } catch (error) {
        console.error("Get all posts error:", error);
        return res.status(500).json({ msg: "Không thể lấy danh sách bài viết" });
    }
};

// Add a comment to a post
const addCommentToPost = async (req, res) => {
    try {
        const { userId } = req.user;
        const { content } = req.body;
        const { postId } = req.params;

        if (!content) {
            return res.status(400).json({ msg: "Vui lòng nhập nội dung bình luận" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "Không tìm thấy người dùng" });
        }

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: "Không tìm thấy bài viết" });
        }

        // Add comment to post
        post.comments.push({
            content,
            user: userId,
            likes: [],
        });

        await post.save();

        // Populate user info in comments
        await post.populate("comments.user", "-password");

        return res.status(200).json(post);
    } catch (error) {
        console.error("Add comment error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể gửi bình luận" });
    }
};

// Get a specific post by ID
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("user", "-password")
            .populate("comments.user", "-password");

        if (!post) {
            return res.status(404).json({ msg: "Không tìm thấy bài viết" });
        }

        return res.status(200).json(post);
    } catch (error) {
        console.error("Get post by ID error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID bài viết không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể lấy thông tin bài viết" });
    }
};

// Get all posts by a specific user
const getPostsByUserId = async (req, res) => {
    try {
        const { userId } = req.user;
        const posts = await Post.find({ user: userId })
            .populate("user", "-password")
            .populate("comments.user", "-password")
            .sort({ createdAt: -1 });

        return res.status(200).json(posts);
    } catch (error) {
        console.error("Get posts by user ID error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID người dùng không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể lấy danh sách bài viết" });
    }
};

const togglePostLike = async (req, res) => {
    try {
        const { userId } = req.user;
        const { postId } = req.params;
        if (!userId) {
            return res.status(400).json({ msg: "Yêu cầu có mã người dùng" });
        }

        const result = await toggleDocumentLike(Post, postId, userId);
        if (result.status !== 200) {
            return res.status(result.status).json({ msg: result.msg });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        console.error("Toggle post like error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể thích bài viết" });
    }
};

// Like/Unlike a comment
const toggleCommentLike = async (req, res) => {
    try {
        const { userId } = req.body;
        const { postId, commentId } = req.params;

        // Validate inputs
        if (!userId) {
            return res.status(400).json({ msg: "Yêu cầu có mã người dùng" });
        }

        const result = await toggleSubdocumentLike(Post, postId, 'comments', commentId, userId);
        if (result.status !== 200) {
            return res.status(result.status).json({ msg: result.msg });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        console.error("Toggle comment like error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể thích bình luận" });
    }
};

// Delete a post
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ msg: "Không tìm thấy bài viết" });
        }

        // Clean up reference in User.posts
        await User.findByIdAndUpdate(post.user, {
            $pull: { posts: post._id }
        });

        await post.deleteOne();

        return res.status(200).json({ msg: "Xóa bài viết thành công" });
    } catch (error) {
        console.error("Delete post error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID bài viết không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể xóa bài viết" });
    }
};

module.exports = {
    addPosts,
    getAllPosts,
    addCommentToPost,
    getPostById,
    getPostsByUserId,
    togglePostLike,
    toggleCommentLike,
    deletePost
};
