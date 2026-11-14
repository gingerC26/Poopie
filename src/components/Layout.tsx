import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <>
      <div className="portrait-gate" role="dialog" aria-label="Use a computer">
        <div className="portrait-gate-card">
          <p className="portrait-gate-kicker">Hold up</p>
          <p className="portrait-gate-title">This gift needs a desk.</p>
          <p className="portrait-gate-body">
            Portrait is too skinny for this gift. Open it on a laptop or a computer — the hourglass
            can wait.
          </p>
        </div>
      </div>
      <Outlet />
    </>
  )
}
