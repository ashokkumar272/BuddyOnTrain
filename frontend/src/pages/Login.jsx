import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance, { setToken } from '../utils/axios'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin 
        ? '/api/users/login' 
        : '/api/users/register'
      
      // For registration, ensure email is included
      if (!isLogin && !formData.email) {
        setError('Email is required for registration')
        setLoading(false)
        return
      }

      const response = await axiosInstance.post(endpoint, formData)
      
      if (response.data.success) {
        // Store token and userId in localStorage
        setToken(response.data.token)
        localStorage.setItem('userId', response.data.userId)
        
        if (isLogin) {
          // If login, redirect to home page
          navigate('/')
        } else {
          // If registration, redirect to profile setup
          navigate('/profile-setup')
        }
      }    } catch (error) {
      console.error('Login/Register error:', error);
      
      // Handle different types of errors
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your internet connection and try again.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection and make sure the server is running.');
      } else if (error.response?.status === 0) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError(
          error.response?.data?.message || 
          'An error occurred. Please try again.'
        );
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
    setError('')
    
    // Reset form data when toggling
    setFormData({
      username: '',
      email: '',
      password: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className='text-white text-2xl font-bold mb-6 text-center'>
          {isLogin ? 'Login' : 'Register'}
        </h2>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium" htmlFor="username">
              Username
            </label>
            <input 
              type="text" 
              id="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 
                       focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Enter your username"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input 
                type="email" 
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg 
                         text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 
                         focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input 
              type="password" 
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 
                       focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold 
                     rounded-lg transition-colors duration-300 focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register'}
          </button>

          <div className="text-center mt-4">
            <button 
              type="button"
              onClick={toggleForm}
              className="text-gray-400 hover:text-blue-500 text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login