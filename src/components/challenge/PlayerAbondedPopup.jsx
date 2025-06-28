import React from "react"
import { UserX } from "lucide-react"

const PlayerAbandoned = () => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg shadow-xl overflow-hidden max-w-md w-full text-center p-8">
        <UserX className="mx-auto text-white mb-4" size={64} />
        <h2 className="text-3xl font-bold text-white mb-2">You Won!</h2>
        <p className="text-xl text-purple-200 mb-6">Your opponent left the game</p>
        <p className="text-sm text-purple-200 mb-6">This game won't be counted as win</p>
        <div className="space-y-4">
          {/* <button className="w-full py-3 px-4 bg-white text-purple-700 rounded-md hover:bg-purple-100 transition-colors font-semibold">
            Find New Game
          </button> */}
          <button onClick={() => history.back()} className="w-full py-3 px-4 bg-transparent border border-white text-white rounded-md hover:bg-white/10 transition-colors font-semibold">
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayerAbandoned

