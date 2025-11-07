import './RunsList.css'

function RunsList({ runs, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (runs.length === 0) {
    return (
      <div className="runs-list empty">
        <p>No runs yet. Add your first one above!</p>
      </div>
    )
  }

  return (
    <div className="runs-list">
      <h2>Your Runs</h2>
      <div className="runs-grid">
        {runs.map((run) => (
          <div key={run.id} className="run-card">
            <div className="run-image">
              <img src={`/uploads/${run.image_path}`} alt="Run" />
            </div>
            <div className="run-info">
              <div className="run-distance">
                <span className="distance-value">{run.distance}</span>
                <span className="distance-unit">km</span>
              </div>
              <div className="run-date">{formatDate(run.date)}</div>
            </div>
            <button
              className="delete-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this run?')) {
                  onDelete(run.id)
                }
              }}
              aria-label="Delete run"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RunsList
