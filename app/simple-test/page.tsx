'use client'

import { useState, useEffect } from 'react'

export default function SimpleTestPage() {
  const [message, setMessage] = useState('Loading...')
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('SimpleTestPage useEffect running!')
    setMessage('JavaScript is working!')
    setCount(1)
  }, [])

  const handleClick = () => {
    setCount(prev => prev + 1)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Simple Test Page</h1>
      <p>Message: {message}</p>
      <p>Count: {count}</p>
      <button onClick={handleClick} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Click me: {count}
      </button>
      <div style={{ marginTop: '20px', background: '#f0f0f0', padding: '10px' }}>
        Current time: {new Date().toISOString()}
      </div>
    </div>
  )
} 