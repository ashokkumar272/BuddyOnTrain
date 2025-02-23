import React from 'react'

const Suggested = ({name}) => {
  return (
    <div className='flex justify-between my-4 p-4 shadow-md'>
        <div>{name}</div>
        <button>Invite</button>
    </div>
  )
}

export default Suggested