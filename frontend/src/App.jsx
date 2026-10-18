import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import BookDetails from "./pages/BookDetails";
import ReviewDetails from "./pages/ReviewDetails";
import SearchResults from "./pages/SearchResults";
import Chapters from "./pages/Chapters";
import ChapterDetail from "./pages/ChapterDetail";
import Dashboard from "./pages/Dashboard";
import Rankings from "./pages/Rankings";
import ForumPage from "./pages/ForumPage";
import NovelAnalytics from "./pages/NovelAnalytics";
import NotFoundPage from './pages/404Page';
import { DarkModeProvider } from "./context/DarkModeContext";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/search" element={<SearchResults />} />

          <Route path="/novels/:id" element={<ProtectedRoute><BookDetails /></ProtectedRoute>} />
          <Route path="/novels/:novelId/reviews/:reviewId" element={<ProtectedRoute><ReviewDetails /></ProtectedRoute>} />
          <Route path="/novels/:id/chapters" element={<ProtectedRoute><Chapters /></ProtectedRoute>} />
          <Route path="/novels/:novelId/chapters/:chapterId" element={<ProtectedRoute><ChapterDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/forum" element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />
          <Route path="/novel-analytics/:novelId" element={<ProtectedRoute><NovelAnalytics /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
};

export default App;
