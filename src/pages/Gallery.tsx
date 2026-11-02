export default function Gallery() {
  return (
    <main className="page">
      <h1>Gallery</h1>
      <p className="lede">
        Drop files into <code>public/photos</code>, then import them here (or
        list filenames in an array).
      </p>
      <div className="gallery-grid">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="gallery-slot">
            photo {i + 1}
          </div>
        ))}
      </div>
    </main>
  )
}
