import { useState, useEffect } from 'react'
import './App.css'
import UploadForm from './components/UploadForm'
import RunsList from './components/RunsList'
import Stats from './components/Stats'

function App() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRuns = async () => {
    try {
      const response = await fetch('/api/runs')
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
  }, [])

  const handleRunAdded = (newRun) => {
    setRuns([newRun, ...runs])
  }

  const handleRunDeleted = async (id) => {
    try {
      await fetch(`/api/runs/${id}`, { method: 'DELETE' })
      setRuns(runs.filter(run => run.id !== id))
    } catch (error) {
      console.error('Error deleting run:', error)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Runtracker</h1>
        {!loading && <Stats runs={runs} />}
      </header>

      <main className="main">
        <UploadForm onRunAdded={handleRunAdded} />

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
