import React from 'react'
import { Link , NavLink} from 'react-router-dom'
import { useState } from 'react'
const Navbar = () => {
  return (
    <>
    <div className='flex justify-around py-6'>
      <h2 className='text-4xl font-bold text-gray-600'>FindBuddy</h2>
      <ul className='flex gap-3'>
        
          <NavLink to="/" className='text-gray-600 hover:text-blue-600 transition-colors'>Home</NavLink>
          <NavLink to="/login" className='text-gray-600 hover:text-blue-600 transition-colors'>Login</NavLink>
          <NavLink to="/signup" className='text-gray-600 hover:text-blue-600 transition-colors'>Sign Up</NavLink>
        
      </ul>
    </div>
    </>
  )
}

export default Navbar