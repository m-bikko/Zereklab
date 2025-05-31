'use client'

import { useState, useEffect } from 'react'

export default function TestAdminPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  useEffect(() => {
    addLog('TestAdminPage useEffect running...')
    
    const fetchData = async () => {
      try {
        addLog('Starting fetch requests...')
        addLog(`Current URL: ${window.location.href}`)
        
        addLog('Fetching products...')
        const productsResponse = await fetch('/api/products?limit=200&sortBy=createdAt&sortOrder=desc', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        addLog(`Products response status: ${productsResponse.status}`)
        addLog(`Products response headers: ${JSON.stringify(Object.fromEntries(productsResponse.headers.entries()))}`)
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          addLog(`Products data length: ${productsData.products?.length || 0}`)
          setProducts(productsData.products || [])
        } else {
          const errorText = await productsResponse.text()
          addLog(`Products fetch failed: ${productsResponse.status} - ${errorText}`)
          setError(`Products fetch failed: ${productsResponse.status}`)
        }

        addLog('Fetching categories...')
        const categoriesResponse = await fetch('/api/categories', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        addLog(`Categories response status: ${categoriesResponse.status}`)
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          addLog(`Categories data length: ${categoriesData.data?.length || 0}`)
          setCategories(categoriesData.data || [])
        } else {
          const errorText = await categoriesResponse.text()
          addLog(`Categories fetch failed: ${categoriesResponse.status} - ${errorText}`)
          setError(`Categories fetch failed: ${categoriesResponse.status}`)
        }
      } catch (err: any) {
        addLog(`Fetch error: ${err.message}`)
        setError('Network error: ' + err.message)
      } finally {
        setLoading(false)
        addLog('Fetch completed')
      }
    }

    fetchData()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Test Admin Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Status:</h3>
        <p>Loading: {loading.toString()}</p>
        <p>Error: {error || 'None'}</p>
        <p>Products: {products.length}</p>
        <p>Categories: {categories.length}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Logs:</h3>
        <div style={{ background: '#f0f0f0', padding: '10px', maxHeight: '200px', overflow: 'auto' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ fontSize: '12px', marginBottom: '2px' }}>{log}</div>
          ))}
        </div>
      </div>

      {!loading && !error && (
        <>
          <h2>Products ({products.length})</h2>
          <ul>
            {products.slice(0, 3).map((product: any) => (
              <li key={product._id}>{product.name} - ${product.price}</li>
            ))}
          </ul>
          
          <h2>Categories ({categories.length})</h2>
          <ul>
            {categories.map((category: any) => (
              <li key={category._id}>{category.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
} 