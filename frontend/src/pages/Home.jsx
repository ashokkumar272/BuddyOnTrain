import React from 'react'
import Hero from '../components/Hero'
import { Navbar } from '../components/layout'
import bg from '../assets/images/bg.jpg'

const Home = () => {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col"
      style={{
        backgroundImage: `url(${bg})`
      }}
    >
      <Navbar/>
      <div className="flex-1 flex items-center justify-center">
        <Hero/>
      </div>
    </div>
  )
}

export default Home