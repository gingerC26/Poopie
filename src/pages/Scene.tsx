import SplineEmbed from '../components/SplineEmbed'

export default function Scene() {
  return (
    <main className="page">
      <h1>3D</h1>
      <p className="lede">
        In Spline: Export → Public URL, then paste it into{' '}
        <code>VITE_SPLINE_SCENE_URL</code>. Restart the dev server after
        changing env vars.
      </p>
      <SplineEmbed />
    </main>
  )
}
