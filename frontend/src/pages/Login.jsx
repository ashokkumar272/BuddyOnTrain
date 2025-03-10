import React from 'react'

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className='text-white text-2xl font-bold mb-6 text-center'>Login</h2>
        <form className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium" htmlFor="username">
              Username
            </label>
            <input 
              type="text" 
              id="username"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 
                       focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input 
              type="password" 
              id="password"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 
                       focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                     rounded-lg transition-colors duration-300 focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Sign In
          </button>

          <div className="text-center mt-4">
            <a href="#" className="text-gray-400 hover:text-blue-500 text-sm transition-colors">
              Don't have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login