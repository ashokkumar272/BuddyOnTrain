import React from 'react'

const Navbar = () => {
  return (
    <>
    <div className='flex justify-around py-6'>
      <h2 className='text-4xl font-bold text-red-600'>FindBuddy</h2>
      <ul className='flex gap-3'>
        <li>Home</li>
        <li>Login</li>
        <li>Sign Up</li>
      </ul>
    </div>
    </>
  )
}

export default Navbar