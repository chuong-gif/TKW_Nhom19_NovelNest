import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import NovelCover from "../components/NovelCover";
import NovelReviews from "../components/NovelReviews";
import Footer from "../utils/Footer";
import LoadingScreen from "../utils/LoadingScreen";
import api from "../services/api";

const BookDetails = () => {
  const { id } = useParams();
  const [novel, setNovel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const userId = Cookies.get("userId");
  const token = Cookies.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchNovelDetails = async () => {
      try {
        const [novelResponse, reviewsResponse] = await Promise.all([
          api.get(`/novels/${id}`),
          api.get(`/novel-reviews/${id}/reviews`),
        ]);

        const novelData = novelResponse.data;
        setNovel(novelData);

        const reviewsData = reviewsResponse.data;
        setReviews(reviewsData);

        setIsLiked(
          Array.isArray(novelData.likes) && novelData.likes.includes(userId)
        );
      } catch (err) {
        console.error("Error fetching novel details:", err);
        setError(err.response?.data?.msg || "Failed to fetch novel details");
      }
    };

    fetchNovelDetails();
  }, [id, userId]);

  const handleLike = async () => {
    try {
      if (!userId || !token) {
        navigate("/login");
        return;
      }
      const response = await api.post(`/novels/${id}/toggle-like`);
      setNovel((prev) => ({
        ...prev,
        likes: response.data.likes,
      }));
      setIsLiked(
        Array.isArray(response.data.likes) &&
          response.data.likes.includes(userId)
      );
    } catch (err) {
      console.error("Like error:", err);
      setError(err.response?.data?.msg || "Failed to update like status");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div
            className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <div className="min-h-screen bg-white dark:bg-black/100">
            <Navbar />
            <div className="container mx-auto px-4 py-8 mt-16">
              <NovelCover novel={novel} onLike={handleLike} isLiked={isLiked} />

              <NovelReviews reviews={reviews} novelId={id} />
            </div>
            <Footer />
          </div>
        </>
      )}
    </>
  );
};

export default BookDetails;
