import { useState, useEffect } from 'react'
import './App.css'
import UploadForm from './components/UploadForm'
import RunsList from './components/RunsList'
import Stats from './components/Stats'
import Auth from './components/Auth'

function App() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(localStorage.getItem('user'))

  const handleLogin = (newToken, username) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', username)
    setToken(newToken)
    setUser(username)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setRuns([])
  }

  const fetchRuns = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/runs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout()
        }
        throw new Error('Failed to fetch')
      }
      const data = await response.json()
      setRuns(data)
    } catch (error) {
      console.error('Error fetching runs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRuns()
  }, [token])

  const handleRunAdded = (newRun) => {
    setRuns([newRun, ...runs])
  }

  const handleRunDeleted = async (id) => {
    try {
      const response = await fetch(`/api/runs/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        setRuns(runs.filter(run => run.id !== id))
      } else if (response.status === 401 || response.status === 403) {
        handleLogout()
      }
    } catch (error) {
      console.error('Error deleting run:', error)
    }
  }

  if (!token) {
    return (
      <div className="app">
        <header className="header">
          <h1>Runtracker</h1>
        </header>
        <Auth onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1>Runtracker</h1>
          <div className="user-controls">
            <span>Inloggad som <strong>{user}</strong></span>
            <button className="logout-btn" onClick={handleLogout}>Logga ut</button>
          </div>
        </div>
        {!loading && <Stats runs={runs} />}
      </header>

      <main className="main">
        <UploadForm onRunAdded={handleRunAdded} token={token} />

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <RunsList runs={runs} onDelete={handleRunDeleted} />
        )}
      </main>
    </div>
  )
}

export default App
