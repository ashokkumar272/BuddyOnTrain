import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance, { isAuthenticated } from '../utils/axios'

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    profession: '',
    bio: '',
    travelStatus: {
      boardingStation: '',
      destinationStation: '',
      travelDate: null,
      isActive: false
    }
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Check if user is authenticated, if not redirect to login
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
    }
  }, [navigate])

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' 
      ? e.target.checked 
      : e.target.value
    
    setFormData({
      ...formData,
      [e.target.id]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      const requiredFields = ['name', 'age', 'profession', 'bio']
      for (const field of requiredFields) {
        if (!formData[field]) {
          setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
          setLoading(false)
          return
        }
      }
      
      // Validate bio length
      if (formData.bio.length > 200) {
        setError('Bio must be 200 characters or less')
        setLoading(false)
        return
      }
      
      // Convert age to number
      const ageNumber = Number(formData.age)
      if (isNaN(ageNumber) || ageNumber <= 0) {
        setError('Please enter a valid age')
        setLoading(false)
        return
      }

      // Prepare the data with correct types
      const profileData = {
        ...formData,
        age: ageNumber,
        profileCompleted: true
      }

      // Send profile data to the server
      const response = await axiosInstance.put('/api/users/profile', profileData)
      
      if (response.data.success) {
        // Redirect to home page after profile setup
        navigate('/')
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'An error occurred. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className='text-white text-2xl font-bold mb-2 text-center'>
          Complete Your Profile
        </h2>
        <p className='text-gray-400 text-sm text-center mb-6'>
          Tell us more about yourself to find travel buddies
        </p>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium" htmlFor="name">
              Full Name
            </label>
            <input 
              type="text" 
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 
                       focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium" htmlFor="age">
              Age
            </label>
            <input 
              type="number" 
              id="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 
                       focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Enter your age"
              min="1"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium" htmlFor="profession">
              Profession
            </label>
            <input 
              type="text" 
              id="profession"
              value={formData.profession}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 
                       focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Enter your profession"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium" htmlFor="bio">
              Bio (max 200 characters)
            </label>
            <textarea 
              id="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 
                       focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Tell us about yourself"
              maxLength={200}
              rows={3}
              required
            ></textarea>
            <p className="text-xs text-gray-400 mt-1">
              {formData.bio.length}/200 characters
            </p>
          </div>
          
          <div className="flex items-center">
            <p className="text-sm font-medium text-gray-300">
              You can set your travel status after completing your profile.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold 
                     rounded-lg transition-colors duration-300 focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfileSetup 