import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axiosInstance, { removeToken, isAuthenticated } from '../../utils/axios'

const Navbar = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invitations, setInvitations] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu
  const [showProfileMenu, setShowProfileMenu] = useState(false); // State for profile menu
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
        // After fetching user data, get friend requests
        fetchFriendRequests()
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

  // Fetch friend requests
  const fetchFriendRequests = async () => {
    try {
      const response = await axiosInstance.get('/api/friends/requests')
      if (response.data.success) {
        // Store incoming requests
        setInvitations(response.data.data.incoming || [])
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    }
  }

  // Handle accepting a friend request
  const handleAcceptInvite = async (requestId) => {
    try {
      const response = await axiosInstance.post('/api/friends/respond', {
        requestId,
        status: 'accepted'
      })
      
      if (response.data.success) {
        // Remove this invitation from the list
        setInvitations(prev => prev.filter(inv => inv._id !== requestId))
      }
    } catch (error) {
      console.error('Error accepting invitation:', error)
    }
  }

  // Handle rejecting a friend request
  const handleRejectInvite = async (requestId) => {
    try {
      const response = await axiosInstance.post('/api/friends/respond', {
        requestId,
        status: 'rejected'
      })
      
      if (response.data.success) {
        // Remove this invitation from the list
        setInvitations(prev => prev.filter(inv => inv._id !== requestId))
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error)
    }
  }

  // Check authentication status and fetch user data on component mount
  useEffect(() => {
    fetchUserData()
    
    // Set up periodic refresh of friend requests (every 30 seconds)
    const interval = setInterval(() => {
      if (isAuthenticated()) {
        fetchFriendRequests()
      }
    }, 30000)
    
    return () => clearInterval(interval)
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

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(prev => !prev)
  }

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // Toggle profile menu
  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  // Navigate to user's dashboard
  const goToDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className='relative shadow-md bg-white'>
      <div className='flex justify-between items-center py-4 px-6 container mx-auto'>
        <h2 className='text-2xl lg:text-4xl font-bold text-blue-600'>FindBuddy</h2>
        <button
          className="lg:hidden text-gray-600 hover:text-blue-600"
          onClick={toggleMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
        <div className='hidden lg:flex items-center gap-4'>
          {loading ? (
            <span className="text-gray-400">Loading...</span>
          ) : user ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={toggleNotifications}
                  className='text-gray-600 hover:text-blue-600 transition-colors relative'
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  
                  {/* Notification Badge - only show if there are invitations */}
                  {invitations.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {invitations.length}
                    </span>
                  )}
                </button>
                
                {/* Notification Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
                    <div className="py-2 px-4 bg-gray-100 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {invitations.length > 0 ? (
                        <div>
                          {invitations.map(invitation => (
                            <div key={invitation._id} className="py-2 px-4 border-b border-gray-100 hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    <span className="font-semibold">{invitation.sender.name || invitation.sender.username}</span> sent you a friend request
                                  </p>
                                  {invitation.sender.profession && (
                                    <p className="text-xs text-gray-500 mt-1">{invitation.sender.profession}</p>
                                  )}
                                </div>
                                <div className="flex gap-2 ml-2">
                                  <button 
                                    onClick={() => handleAcceptInvite(invitation._id)}
                                    className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => handleRejectInvite(invitation._id)}
                                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-gray-500">
                          No new notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="text-gray-600 hover:text-blue-600 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                    <NavLink
                      to="/dashboard"
                      className="block py-2 px-4 text-gray-600 hover:text-blue-600"
                      onClick={toggleProfileMenu}
                    >
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/chats"
                      className="block py-2 px-4 text-gray-600 hover:text-blue-600"
                      onClick={toggleProfileMenu}
                    >
                      Chats
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-2 px-4 text-gray-600 hover:text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <NavLink to="/login" className='text-gray-600 hover:text-blue-600 transition-colors'>Login</NavLink>
          )}
        </div>
      </div>
      {menuOpen && (
        <div className="lg:hidden bg-gray-100 shadow-md">
          <NavLink
            to="/"
            className="block py-2 px-4 text-gray-600 hover:text-blue-600"
            onClick={toggleMenu}
          >
            Home
          </NavLink>
          {loading ? (
            <span className="block py-2 px-4 text-gray-400">Loading...</span>
          ) : user ? (
            <>
              <button
                onClick={toggleNotifications}
                className="block py-2 px-4 text-gray-600 hover:text-blue-600"
              >
                Notifications
              </button>
              <button
                onClick={toggleProfileMenu}
                className="block py-2 px-4 text-gray-600 hover:text-blue-600"
              >
                Profile
              </button>
              {showProfileMenu && (
                <div className="bg-gray-100 shadow-md">
                  <NavLink
                    to="/dashboard"
                    className="block py-2 px-4 text-gray-600 hover:text-blue-600"
                    onClick={toggleProfileMenu}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/chats"
                    className="block py-2 px-4 text-gray-600 hover:text-blue-600"
                    onClick={toggleProfileMenu}
                  >
                    Chats
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 px-4 text-gray-600 hover:text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <NavLink
              to="/login"
              className="block py-2 px-4 text-gray-600 hover:text-blue-600"
              onClick={toggleMenu}
            >
              Login
            </NavLink>
          )}
        </div>
      )}
    </div>
  )
}

export default Navbar