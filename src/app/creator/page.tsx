"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CreatorDashboard() {
  const router = useRouter()
  const [missions, setMissions] = useState([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/v1/auth/me')
      if (res.ok) setProfile(await res.json())
    } catch(e) {}
  }

  const fetchMissions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/missions?status=OPEN')
      if (res.status === 401 || res.status === 403) router.push('/api/auth/signin')
      const data = await res.json()
      if (res.ok) setMissions(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
     fetchProfile()
     fetchMissions()
  }, [])

  const handleUpload = async (missionId: string) => {
    if (!profile?.payout_account_id) {
       alert('Please onboard with Stripe to receive payouts before accepting missions.');
       return;
    }

    setUploadingFor(missionId)
    try {
      const initRes = await fetch(`/api/v1/missions/${missionId}/submissions/init-upload`, { method: 'POST' })
      const initData = await initRes.json()

      await new Promise(r => setTimeout(r, 1000))

      await fetch(`/api/v1/missions/${missionId}/submissions/complete-upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissionId: initData.submissionId })
      })
      alert('Upload completed! Submission is processing.')
    } catch (e) {
      alert('Upload failed')
    }
    setUploadingFor(null)
  }

  const handleStripeOnboard = async () => {
      try {
          const res = await fetch('/api/v1/creator/onboarding', { method: 'POST' })
          if (res.ok) {
              const data = await res.json()
              alert(`Navigating to Stripe Connect Onboarding:\n${data.url}`)
              // window.location.href = data.url
              fetchProfile()
          }
      } catch(e) {}
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Creator Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {profile?.name || 'Creator'}</p>
          </div>
          <div>
             {!profile?.payout_account_id ? (
                 <button onClick={handleStripeOnboard} className="bg-[#635BFF] text-white px-4 py-2 rounded shadow-sm hover:bg-[#4b45cf] transition font-medium">
                     Setup Stripe Payouts
                 </button>
             ) : (
                 <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                     Stripe Connected
                 </span>
             )}
          </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Available Missions</h2>
            <button onClick={fetchMissions} disabled={loading} className="text-blue-600 text-sm hover:underline disabled:opacity-50 font-medium">
                {loading ? 'Refreshing...' : 'Refresh Board'}
            </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          {missions.length > 0 ? (
            <ul className="space-y-4">
              {missions.map((m: any) => (
                <li key={m.id} className="bg-white p-5 rounded-lg border border-gray-200 hover:border-blue-300 transition">
                   <div className="flex justify-between items-start">
                       <div>
                           <h3 className="font-bold text-lg text-gray-900">{m.title}</h3>
                           <p className="text-sm text-gray-600 mt-1 max-w-2xl">{m.description}</p>
                           <div className="mt-3 flex gap-2 flex-wrap">
                               <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">FPS: {m.required_fps || 'Any'}</span>
                               <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Res: {m.required_resolution || 'Any'}</span>
                               <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Env: {m.environment_type}</span>
                           </div>
                       </div>
                       <div className="text-right">
                           <p className="text-2xl font-bold text-green-600">${m.price_per_minute.toFixed(2)}<span className="text-sm text-gray-500 font-normal">/min</span></p>
                           <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{m.license_type}</p>
                       </div>
                   </div>

                   <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                       <button disabled={uploadingFor === m.id} onClick={() => handleUpload(m.id)} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm transition">
                          {uploadingFor === m.id ? 'Uploading...' : 'Accept Mission & Upload Video'}
                       </button>
                   </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No open missions available right now.</p>
          )}
        </div>
      </div>
    </div>
  )
}
