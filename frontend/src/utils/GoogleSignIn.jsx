import { useState, useContext } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import AuthContext from "../context/AuthContext";
import googleIcon from '../assets/google_icon.jpg';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const GoogleSignIn = () => {
  const { update } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsLoading(true);
        const { data } = await api.post('/oauth/google-login', {
          token: response.access_token
        });

        if (data.success) {
          Cookies.set('token', data.token, {
            expires: 1,
            secure: import.meta.env.PROD,
            sameSite: 'Lax'
          });
          
          Cookies.set('userId', data.userId);
          
          await update();
          toast.success('Đăng nhập Google thành công!');
          navigate('/home');
        } else {
          toast.error(data.msg || 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
      } catch (error) {
        console.error("Google login failed:", error);
        toast.error(error.response?.data?.msg || 'Xác thực thất bại. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth Error:', error);
      toast.error('Không thể kết nối với Google. Vui lòng thử lại.');
      setIsLoading(false);
    }
  });

  return (
    <button
        onClick={() => !isLoading && handleGoogleLogin()}
      disabled={isLoading}
        className='w-full flex items-center justify-center bg-white border border-black/40 rounded-md my-4 p-4 cursor-pointer disabled:opacity-50'
      >
        {isLoading ? (
          <span>Đang đăng nhập...</span>
        ) : (
          <>
            <img src={googleIcon} className='h-6 mr-2' alt="Google Icon" />
            Đăng nhập bằng Google
          </>
        )}
    </button>
  );
};

export default GoogleSignIn;
