const Chapter = require('../models/Chapter');
const Novel = require('../models/Novel');

const uploadChapter = async (req, res) => {
    try {
        const { novelId } = req.params;
        const { chapterName, chapterContent } = req.body;

        if (!novelId || !chapterName || !chapterContent) {
            return res.status(400).json({ msg: "Vui lòng nhập tên chương và nội dung chương." });
        }

        const novel = await Novel.findById(novelId);
        if (!novel) {
            return res.status(404).json({ msg: "Không tìm thấy truyện" });
        }

        // Retry on duplicate key error (E11000)
        let newChapter = null;
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const highestChapter = await Chapter.findOne({ novel: novelId })
                    .sort({ chapterNumber: -1 });
                const chapterNumber = highestChapter ? highestChapter.chapterNumber + 1 : 1;

                newChapter = new Chapter({
                    novel: novelId,
                    chapterNumber,
                    chapterName,
                    chapterContent
                });
                await newChapter.save();
                break;
            } catch (err) {
                if ((err.code === 11000 || err.message?.includes('E11000')) && attempt === 0) {
                    continue; // Retry once
                }
                throw err;
            }
        }

        novel.chapters.push(newChapter._id);
        await novel.save();

        return res.status(201).json({ msg: "Tải lên chương thành công" });
    } catch (error) {
        console.error('Upload chapter error:', error);
        return res.status(500).json({ msg: "Không thể tải lên chương" });
    }
};

const getChapterById = async (req, res) => {
    try {
        const { novelId, chapterId } = req.params;

        const chapter = await Chapter.findOne({ _id: chapterId, novel: novelId });

        if (!chapter) {
            return res.status(404).json({ msg: "Không tìm thấy chương" });
        }

        return res.status(200).json(chapter);
    } catch (error) {
        console.error('Get chapter by ID error:', error);
        return res.status(500).json({ msg: "Không thể lấy nội dung chương" });
    }
};

const getChaptersByNovelId = async (req, res) => {
    try {
        const { novelId } = req.params;

        const chapters = await Chapter.find({ novel: novelId }).sort('chapterNumber');

        if (chapters.length === 0) {
            return res.status(200).json({ msg: "Chưa có chương nào cho truyện này." });
        }

        return res.status(200).json(chapters);
    } catch (error) {
        console.error('Get chapters by novel ID error:', error);
        return res.status(500).json({ msg: "Không thể lấy danh sách chương" });
    }
};

module.exports = {
    uploadChapter,
    getChapterById,
    getChaptersByNovelId,
};