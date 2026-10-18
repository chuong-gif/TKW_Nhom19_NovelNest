const User = require('../models/User');
const Novel = require('../models/Novel');
const Review = require('../models/Review');
const Post = require('../models/Post');

// Check if user owns the novel (author) or is admin
const checkNovelOwner = async (req, res, next) => {
    try {
        const novelId = req.params.id || req.params.novelId;
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(401).json({ msg: "User not found" });
        }
        if (user.role === 'admin') {
            return next();
        }

        const novel = await Novel.findById(novelId).populate('author');
        if (!novel) {
            return res.status(404).json({ msg: "Novel not found" });
        }

        if (!novel.author || novel.author.user.toString() !== user._id.toString()) {
            return res.status(403).json({ msg: "Access denied. Not the author of this novel." });
        }

        next();
    } catch (error) {
        console.error("Check novel owner error:", error);
        return res.status(500).json({ msg: "Server error checking permissions" });
    }
};

// Check if user has permission to upload chapter for this novel
const checkChapterUploadPermission = async (req, res, next) => {
    try {
        const { novelId } = req.params;
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(401).json({ msg: "User not found" });
        }
        if (user.role === 'admin') {
            return next();
        }

        const novel = await Novel.findById(novelId).populate('author');
        if (!novel) {
            return res.status(404).json({ msg: "Novel not found" });
        }

        if (!novel.author || novel.author.user.toString() !== user._id.toString()) {
            return res.status(403).json({ msg: "Access denied. Not the author of this novel." });
        }

        next();
    } catch (error) {
        console.error("Check chapter upload permission error:", error);
        return res.status(500).json({ msg: "Server error checking permissions" });
    }
};

// Check if user owns the review or is admin
const checkReviewOwner = async (req, res, next) => {
    try {
        const reviewId = req.params.reviewId || req.params.id;
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(401).json({ msg: "User not found" });
        }
        if (user.role === 'admin') {
            return next();
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ msg: "Review not found" });
        }

        if (review.user.toString() !== user._id.toString()) {
            return res.status(403).json({ msg: "Access denied. Not the owner of this review." });
        }

        next();
    } catch (error) {
        console.error("Check review owner error:", error);
        return res.status(500).json({ msg: "Server error checking permissions" });
    }
};

// Check if user owns the post or is admin
const checkPostOwner = async (req, res, next) => {
    try {
        const postId = req.params.id || req.params.postId;
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(401).json({ msg: "User not found" });
        }
        if (user.role === 'admin') {
            return next();
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        if (post.user.toString() !== user._id.toString()) {
            return res.status(403).json({ msg: "Access denied. Not the owner of this post." });
        }

        next();
    } catch (error) {
        console.error("Check post owner error:", error);
        return res.status(500).json({ msg: "Server error checking permissions" });
    }
};

module.exports = {
    checkNovelOwner,
    checkChapterUploadPermission,
    checkReviewOwner,
    checkPostOwner
};
