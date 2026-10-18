import { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { FaVolumeUp, FaVolumeMute, FaArrowLeft, FaArrowRight, FaBook, FaBookReader } from "react-icons/fa";
import DarkModeContext from "../context/DarkModeContext";
import LoadingScreen from "../utils/LoadingScreen";
import Footer from "../utils/Footer";
import api from "../services/api";

const splitTextIntoChunks = (text, maxLength = 180) => {
  if (!text) return [];
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      if (sentence.length > maxLength) {
        for (let i = 0; i < sentence.length; i += maxLength) {
          chunks.push(sentence.slice(i, i + maxLength).trim());
        }
        currentChunk = "";
      } else {
        currentChunk = sentence;
      }
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks.filter(Boolean);
};

const getVietnameseVoice = () => {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const exactVi = voices.find((v) => v.lang === "vi-VN");
  if (exactVi) return exactVi;
  const viVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("vi"));
  return viVoice || null;
};

const ChapterDetail = () => {
  const { novelId, chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { isDarkMode } = useContext(DarkModeContext);
  const [showControls, setShowControls] = useState(true);
  const sessionRef = useRef(0);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchChapterAndChaptersList = async () => {
      try {
        const chaptersResponse = await api.get(`/chapters/${novelId}/chapters`);
        setChapters(chaptersResponse.data);

        const chapterResponse = await api.get(
          `/chapters/${novelId}/chapters/${chapterId}`
        );
        setChapter(chapterResponse.data);
      } catch (err) {
        setError("Không thể tải nội dung chương");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterAndChaptersList();
  }, [novelId, chapterId]);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }

    return () => {
      sessionRef.current += 1;
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    };
  }, [chapterId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chapterId]);

  useEffect(() => {
    const handleScroll = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handleTextToSpeech = () => {
    if (!("speechSynthesis" in window)) {
      alert("Trình duyệt của bạn không hỗ trợ đọc văn bản.");
      return;
    }

    if (isSpeaking) {
      sessionRef.current += 1;
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!chapter?.chapterContent) return;

    sessionRef.current += 1;
    const currentSession = sessionRef.current;
    window.speechSynthesis.cancel();

    const chunks = splitTextIntoChunks(chapter.chapterContent);
    if (chunks.length === 0) return;

    const voice = getVietnameseVoice();
    setIsSpeaking(true);

    let currentIdx = 0;
    const speakNextChunk = () => {
      if (sessionRef.current !== currentSession) return;
      if (currentIdx >= chunks.length) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[currentIdx]);
      utterance.lang = "vi-VN";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        if (sessionRef.current !== currentSession) return;
        currentIdx += 1;
        speakNextChunk();
      };

      utterance.onerror = (e) => {
        console.error("Speech synthesis error occurred", e);
        if (sessionRef.current !== currentSession) return;
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextChunk();
  };

  if (loading) return <LoadingScreen />;
  
  if (error) return (
    <div className={`min-h-screen flex justify-center items-center ${
      isDarkMode ? 'bg-gradient-to-br from-gray-900 to-black text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="text-xl font-medium text-red-500">{error}</div>
    </div>
  );

  const currentChapterIndex = chapters.findIndex((ch) => ch._id === chapterId);
  const nextChapter = chapters[currentChapterIndex + 1];
  const prevChapter = chapters[currentChapterIndex - 1];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gray-50'
    }`}>
      <Navbar />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 py-28"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg'
              : 'bg-white'
          }`}
        >
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <FaBookReader className={`text-3xl ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`} />
                <h1 className={`text-4xl font-extrabold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {chapter.chapterName}
                </h1>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTextToSpeech}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isSpeaking
                    ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900'
                    : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'
                } text-white shadow-lg hover:shadow-xl`}
              >
                {isSpeaking ? (
                  <>
                    <FaVolumeMute className="text-xl" />
                    <span>Dừng đọc</span>
                  </>
                ) : (
                  <>
                    <FaVolumeUp className="text-xl" />
                    <span>Đọc to</span>
                  </>
                )}
              </motion.button>
            </div>

            <div className={`prose max-w-none ${
              isDarkMode ? 'prose-invert' : ''
            }`}>
              <p className={`text-lg leading-relaxed whitespace-pre-wrap text-left ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {chapter.chapterContent}
              </p>
            </div>

            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={`
                    fixed z-50 inset-x-0 bottom-4 mx-auto w-fit flex flex-wrap items-center justify-center gap-2 p-3 sm:p-4 rounded-xl shadow-xl backdrop-blur-lg
                    ${isDarkMode ? 'bg-gray-900/70' : 'bg-white/70'}
                  `}
                >
                  {prevChapter ? (
                    <Link
                      to={`/novels/${novelId}/chapters/${prevChapter._id}`}
                      className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium 
                        transition-all duration-300 transform hover:-translate-y-0.5 
                        bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900
                        text-white shadow-lg hover:shadow-xl`}
                    >
                      <FaArrowLeft className="text-sm sm:text-base" />
                      <span>Chương trước</span>
                    </Link>
                  ) : (
                    <span className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base
                      ${isDarkMode ? 'text-gray-400 bg-gray-800/50' : 'text-gray-500 bg-gray-100/50'}`}
                    >
                      <FaArrowLeft className="text-sm sm:text-base opacity-50" />
                      <span>Đầu</span>
                    </span>
                  )}

                  <Link
                    to={`/novels/${novelId}`}
                    className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium 
                      transition-all duration-300 transform hover:-translate-y-0.5 
                      ${isDarkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      } shadow-lg hover:shadow-xl`}
                  >
                    <FaBook className="text-sm sm:text-base" />
                    <span>Tổng quan</span>
                  </Link>

                  {nextChapter ? (
                    <Link
                      to={`/novels/${novelId}/chapters/${nextChapter._id}`}
                      className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium 
                        transition-all duration-300 transform hover:-translate-y-0.5 
                        bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900
                        text-white shadow-lg hover:shadow-xl`}
                    >
                      <span>Chương sau</span>
                      <FaArrowRight className="text-sm sm:text-base" />
                    </Link>
                  ) : (
                    <span className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base
                      ${isDarkMode ? 'text-gray-400 bg-gray-800/50' : 'text-gray-500 bg-gray-100/50'}`}
                    >
                      <span>Cuối</span>
                      <FaArrowRight className="text-sm sm:text-base opacity-50" />
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
      <Footer/>
    </div>
  );
};

export default ChapterDetail;
