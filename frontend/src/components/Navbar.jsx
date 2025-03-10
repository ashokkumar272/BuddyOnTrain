import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axiosInstance, { removeToken, isAuthenticated } from '../utils/axios'

const Navbar = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Fetch current user data from the API
  const fetchUserData = async () => {
    if (!isAuthenticated()) {
      setLoading(false)
      return
    }
    
    try {
      const response = await axiosInstance.get('/api/users/me')
      if (response.data.success) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      // If token is invalid, log the user out
      if (error.response?.status === 401) {
        handleLogout()
      }
    } finally {
      setLoading(false)
    }
  }

  // Check authentication status and fetch user data on component mount
  useEffect(() => {
    fetchUserData()
  }, [])

  const handleLogout = async () => {
    try {
      // Only make API call if we have userId
      const userId = localStorage.getItem('userId')
      if (userId) {
        await axiosInstance.post('/api/users/logout', { userId })
      }
      
      // Remove token and userId from localStorage
      removeToken()
      
      // Update state
      setUser(null)
      
      // Redirect to login page
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if API call fails, still clear local data
      removeToken()
      setUser(null)
      navigate('/login')
    }
  }

  return (
    <>
    <div className='flex justify-around py-6'>
      <h2 className='text-4xl font-bold text-gray-600'>FindBuddy</h2>
      <ul className='flex gap-3'>
        
        <NavLink to="/" className='text-gray-600 hover:text-blue-600 transition-colors'>Home</NavLink>
        
        {loading ? (
          <span className="text-gray-400">Loading...</span>
        ) : user ? (
          <>
            <NavLink to="/dashboard" className='text-gray-600 hover:text-blue-600 transition-colors mr-3'>Dashboard</NavLink>
            <button 
              onClick={handleLogout} 
              className='text-gray-600 hover:text-red-600 transition-colors'
            >
              Logout ({user.username})
            </button>
          </>
        ) : (
          <NavLink to="/login" className='text-gray-600 hover:text-blue-600 transition-colors'>Login</NavLink>
        )}
        
      </ul>
    </div>
    </>
  )
}

export default Navbar