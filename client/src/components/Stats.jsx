import './Stats.css'

function Stats({ runs }) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Calculate monthly total
  const monthlyTotal = runs
    .filter(run => {
      const runDate = new Date(run.date)
      return runDate.getMonth() === currentMonth && runDate.getFullYear() === currentYear
    })
    .reduce((sum, run) => sum + parseFloat(run.distance), 0)

  // Calculate yearly total
  const yearlyTotal = runs
    .filter(run => {
      const runDate = new Date(run.date)
      return runDate.getFullYear() === currentYear
    })
    .reduce((sum, run) => sum + parseFloat(run.distance), 0)

  const monthName = now.toLocaleDateString('sv-SE', { month: 'long' })

  return (
    <div className="stats">
      <div className="stat-item">
        <div className="stat-label">{monthName}</div>
        <div className="stat-value">
          {monthlyTotal.toFixed(1)} <span className="stat-unit">km</span>
        </div>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-item">
        <div className="stat-label">{currentYear}</div>
        <div className="stat-value">
          {yearlyTotal.toFixed(1)} <span className="stat-unit">km</span>
        </div>
      </div>
    </div>
  )
}

export default Stats
