import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listSwapRequests, removeSwapRequest, SwapRequest } from "@/lib/swaps";
import { Button } from "@/components/ui/button";

const SwapBoard: React.FC = () => {
  const [version, setVersion] = useState(0);
  const requests = useMemo(() => listSwapRequests(), [version]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Swap Board</h1>
        <div className="flex gap-2">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link to="/">Back to Game</Link>
          </Button>
          <Button variant="secondary" onClick={() => setVersion((v) => v + 1)}>
            Refresh
          </Button>
        </div>
      </div>

      {requests.length === 0 ? (
        <p className="text-slate-300">No swap requests yet. Post one from the game near a house.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((r: SwapRequest) => (
            <div key={r.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">
                {new Date(r.createdAt).toLocaleString()}
              </div>
              <div className="text-lg font-medium mb-2">
                {r.amount} {r.fromToken} → {r.toToken}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Review & Swap
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    removeSwapRequest(r.id);
                    setVersion((v) => v + 1);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SwapBoard;

