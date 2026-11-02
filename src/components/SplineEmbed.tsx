import { lazy, Suspense } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

const sceneUrl = import.meta.env.VITE_SPLINE_SCENE_URL as string | undefined

export default function SplineEmbed() {
  if (!sceneUrl) {
    return (
      <div className="spline-frame">
        <div className="placeholder">
          <h2>Spline scene</h2>
          <p className="hint">
            Copy <code>.env.example</code> to <code>.env</code> and set{' '}
            <code>VITE_SPLINE_SCENE_URL</code> to your public Spline URL.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="spline-frame">
      <Suspense
        fallback={
          <div className="placeholder">
            <p className="hint">Loading 3D scene…</p>
          </div>
        }
      >
        <Spline scene={sceneUrl} />
      </Suspense>
    </div>
  )
}
