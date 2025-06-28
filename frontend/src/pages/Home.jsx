import React from 'react'
import Hero from '../components/Hero'
import { Navbar } from '../components/layout'
import bg from '../assets/images/bg.jpg'

const Home = () => {  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url(${bg})`
      }}
    >
      <div className="fixed top-0 left-0 right-0 z-[200]">
        <Navbar/>
      </div>
      <div className="min-h-screen flex items-center justify-center">
        <Hero/>
      </div>
    </div>
  )
}

export default Home