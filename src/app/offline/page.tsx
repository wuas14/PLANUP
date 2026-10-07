export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">??</div>
        <h1 className="text-3xl font-black text-white mb-2">
          Plan<span className="text-indigo-400">Up</span>
        </h1>
        <h2 className="text-xl font-bold text-slate-300 mb-4">
          Vous ˆtes hors ligne
        </h2>
        <p className="text-slate-400 mb-8">
          Ne vous inqui‚tez pas ! Toutes vos tƒches sont sauvegard‚es localement.
          Reconnectez-vous pour synchroniser vos donn‚es.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          ?? R‚essayer
        </button>
      </div>
    </div>
  );
}
