const User = require('../models/User');

/**
 * Toggle like on a top-level document (Post, Review, Novel...)
 * @param {Object} Model - Mongoose model
 * @param {string} docId - ID of the document
 * @param {string} userId - ID of the user
 * @param {Object} [extraSync] - Optional sync with User (e.g. { field: 'likedNovels' })
 */
async function toggleDocumentLike(Model, docId, userId, extraSync = null) {
    const user = await User.findById(userId);
    if (!user) {
        return { status: 404, msg: 'User not found' };
    }

    const doc = await Model.findById(docId);
    if (!doc) {
        return { status: 404, msg: `${Model.modelName || 'Document'} not found` };
    }

    const isLiked = doc.likes.some(id => id.toString() === userId.toString());
    const update = isLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };

    const updatedDoc = await Model.findByIdAndUpdate(docId, update, { new: true });

    if (extraSync && extraSync.field) {
        const userUpdate = isLiked 
            ? { $pull: { [extraSync.field]: docId } } 
            : { $addToSet: { [extraSync.field]: docId } };
        await User.findByIdAndUpdate(userId, userUpdate);
    }

    return { status: 200, data: updatedDoc };
}

/**
 * Toggle like on a subdocument array (e.g., post.comments, review.replies)
 * @param {Object} ParentModel - Parent mongoose model (Post, Review)
 * @param {string} parentId - ID of parent doc
 * @param {string} subArrayField - Field name of subdocument array ('comments', 'replies')
 * @param {string} subId - ID of the subdocument
 * @param {string} userId - ID of the user
 */
async function toggleSubdocumentLike(ParentModel, parentId, subArrayField, subId, userId) {
    const user = await User.findById(userId);
    if (!user) {
        return { status: 404, msg: 'User not found' };
    }

    const parent = await ParentModel.findById(parentId);
    if (!parent) {
        return { status: 404, msg: `${ParentModel.modelName || 'Document'} not found` };
    }

    const subDoc = parent[subArrayField]?.id(subId);
    if (!subDoc) {
        const subName = subArrayField === 'comments' ? 'Comment' : subArrayField === 'replies' ? 'Reply' : 'Item';
        return { status: 404, msg: `${subName} not found` };
    }

    const isLiked = subDoc.likes.some(id => id.toString() === userId.toString());
    const fieldPath = `${subArrayField}.$.likes`;
    const update = isLiked ? { $pull: { [fieldPath]: userId } } : { $addToSet: { [fieldPath]: userId } };

    const updatedParent = await ParentModel.findOneAndUpdate(
        { _id: parentId, [`${subArrayField}._id`]: subId },
        update,
        { new: true }
    );

    return { status: 200, data: updatedParent };
}

module.exports = {
    toggleDocumentLike,
    toggleSubdocumentLike
};
