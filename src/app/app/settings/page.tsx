export default function SettingsPage() {
  return (
    <div className="space-y-4 max-w-md">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <label className="block">
        <div className="text-sm text-gray-400">Default niche</div>
        <input className="mt-1 w-full rounded-md border border-gray-800 bg-transparent px-3 py-2" placeholder="e.g., fitness" />
      </label>

      <label className="block">
        <div className="text-sm text-gray-400">Default platform</div>
        <select className="mt-1 w-full rounded-md border border-gray-800 bg-transparent px-3 py-2">
          <option value="tiktok">TikTok</option>
          <option value="shorts">YouTube Shorts</option>
          <option value="reels">Instagram Reels</option>
          <option value="linkedin">LinkedIn</option>
        </select>
      </label>

      <button className="rounded-md bg-white px-4 py-2 text-black">Save (non-functional)</button>
    </div>
  )
}
