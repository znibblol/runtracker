import { useState } from 'react'
import './UploadForm.css'

function UploadForm({ onRunAdded }) {
  const [distance, setDistance] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!distance || !image) {
      alert('Please provide both distance and image')
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.append('distance', distance)
    formData.append('image', image)

    try {
      const response = await fetch('/api/runs', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newRun = await response.json()
        onRunAdded(newRun)
        setDistance('')
        setImage(null)
        setPreview(null)
        e.target.reset()
      }
    } catch (error) {
      console.error('Error uploading run:', error)
      alert('Failed to upload run')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="distance">Distance (km)</label>
        <input
          id="distance"
          type="number"
          step="0.1"
          min="0"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          placeholder="Enter distance"
          disabled={uploading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">Upload Image</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={uploading}
        />
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
          </div>
        )}
      </div>

      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Add Run'}
      </button>
    </form>
  )
}

export default UploadForm
