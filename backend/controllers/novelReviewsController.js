const Review = require("../models/Review");
const Novel = require("../models/Novel");
const User = require("../models/User");
const { toggleDocumentLike, toggleSubdocumentLike } = require("../utils/likeHelper");

// Internal helper to populate review data
const populateReviewQuery = (query) => {
    return query
        .populate("user", "-password")
        .populate({
            path: "replies.user",
            select: "-password",
        });
};

// Internal function to fetch reviews for a novel
const fetchReviewsForNovel = async (novelId) => {
    return populateReviewQuery(Review.find({ novel: novelId })).sort({ createdAt: -1 });
};

// Add a review to a novel
const addReview = async (req, res) => {
    try {
        const { userId } = req.user;
        const { reviewTitle, reviewContent } = req.body;
        const novelId = req.params.novelId;

        // Validate required fields
        if (!reviewTitle || !reviewContent) {
            return res
                .status(400)
                .json({ msg: "Review title, content and userId are required" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Check if novel exists
        const novel = await Novel.findById(novelId);
        if (!novel) {
            return res.status(404).json({ msg: "Novel not found" });
        }

        // Create new review
        const review = new Review({
            user: userId,
            novel: novelId,
            reviewTitle,
            reviewContent,
            likes: [],
            replies: [],
        });

        // Save the review
        await review.save();

        // Add review reference to novel and user
        await Novel.findByIdAndUpdate(novelId, { $push: { reviews: review._id } });
        await User.findByIdAndUpdate(userId, { $push: { reviews: review._id } });

        // Populate user info before sending response
        await review.populate("user", "-password");

        return res.status(201).json(review);
    } catch (error) {
        console.error("Add review error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Invalid ID format" });
        }
        return res.status(500).json({ msg: "Failed to add review" });
    }
};

// Get all reviews for a novel
const getNovelReviews = async (req, res) => {
    try {
        const reviews = await fetchReviewsForNovel(req.params.novelId);
        return res.status(200).json(reviews);
    } catch (error) {
        console.error("Get novel reviews error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Invalid novel ID format" });
        }
        return res.status(500).json({ msg: "Failed to fetch reviews" });
    }
};

// Add a reply to a review
const addReplyToReview = async (req, res) => {
    try {
        const { userId } = req.user;
        const { content } = req.body;
        const { reviewId } = req.params;

        if (!content || !userId) {
            return res.status(400).json({ msg: "Content and userId are required" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Find the review
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ msg: "Review not found" });
        }

        // Add reply to review
        review.replies.push({
            content,
            user: userId,
            likes: [],
        });

        await review.save();

        // Populate user info in replies
        await review.populate("replies.user", "-password");

        return res.status(200).json(review);
    } catch (error) {
        console.error("Add reply error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Invalid ID format" });
        }
        return res.status(500).json({ msg: "Failed to add reply" });
    }
};

// Toggle like on a review
const toggleReviewLike = async (req, res) => {
    try {
        const { userId } = req.user;
        const { reviewId } = req.params;
        if (!userId) {
            return res.status(400).json({ msg: "userId is required" });
        }

        const result = await toggleDocumentLike(Review, reviewId, userId);
        if (result.status !== 200) {
            return res.status(result.status).json({ msg: result.msg });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        console.error("Toggle review like error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Invalid ID format" });
        }
        return res.status(500).json({ msg: "Failed to toggle review like" });
    }
};

// Toggle like on a reply
const toggleReplyLike = async (req, res) => {
    try {
        const { userId } = req.user;
        const { reviewId, replyId } = req.params;
        if (!userId) {
            return res.status(400).json({ msg: "userId is required" });
        }

        const result = await toggleSubdocumentLike(Review, reviewId, 'replies', replyId, userId);
        if (result.status !== 200) {
            return res.status(result.status).json({ msg: result.msg });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        console.error("Toggle reply like error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Invalid ID format" });
        }
        return res.status(500).json({ msg: "Failed to toggle reply like" });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        // Find the review
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ msg: "Review not found" });
        }

        // Clean up orphan references
        // 1. Remove from novel's reviews array
        if (review.novel) {
            await Novel.findByIdAndUpdate(review.novel, {
                $pull: { reviews: review._id }
            });
        }

        // 2. Remove from user's reviews array
        await User.updateMany(
            { reviews: review._id },
            { $pull: { reviews: review._id } }
        );

        // 3. Delete the review
        await review.deleteOne();

        return res.status(200).json({ msg: "Review deleted successfully" });
    } catch (error) {
        console.error("Delete review error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Invalid review ID format" });
        }
        return res.status(500).json({ msg: "Failed to delete review" });
    }
};

// Get a specific review by ID
const getReviewsById = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await populateReviewQuery(Review.findById(reviewId));

        if (!review) {
            return res.status(404).json({ msg: "Review not found" });
        }

        return res.status(200).json(review);
    } catch (error) {
        console.error("Get review by ID error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Invalid review ID format" });
        }
        return res.status(500).json({ msg: "Failed to fetch review" });
    }
};

// Get all reviews for a specific novel
const getReviewsByNovelId = async (req, res) => {
    try {
        const { novelId } = req.params;
        const reviews = await fetchReviewsForNovel(novelId);
        return res.status(200).json(reviews);
    } catch (error) {
        console.error("Get reviews by novel ID error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Invalid novel ID format" });
        }
        return res.status(500).json({ msg: "Failed to fetch reviews" });
    }
};

module.exports = {
    addReview,
    getNovelReviews,
    getReviewsByNovelId,
    getReviewsById,
    addReplyToReview,
    toggleReviewLike,
    toggleReplyLike,
    deleteReview,
};
