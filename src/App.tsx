import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Toaster, toast } from "sonner";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
      <header className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-20 flex justify-center items-center border-b border-blue-700 shadow-lg px-6">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">IdioQ</h1>
          <h2 className="text-sm text-white tracking-tight">A pointless counter for pointless questions</h2>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl mx-auto">
          <DumbQuestionsApp />
        </div>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

function DumbQuestionsApp() {
  const [userName, setUserName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [lastActivityCount, setLastActivityCount] = useState(0);
  const [previousUserName, setPreviousUserName] = useState(""); // Track previous name for cleanup
  const [showDebugPanel, setShowDebugPanel] = useState(false); // Toggle debug panel visibility

  const counters = useQuery(api.counters.getCounters);
  const onlineUsers = useQuery(api.users.getOnlineUsers);
  const recentActivities = useQuery(api.counters.getRecentActivities);
  
  const incrementCounters = useMutation(api.counters.incrementCounters);
  const updatePresence = useMutation(api.users.updatePresence);
  const resetCounters = useMutation(api.counters.resetCounters);

  // Load username from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("dumbQuestionsUserName");
    if (savedName) {
      setUserName(savedName);
      setPreviousUserName(savedName);
    } else {
      setShowNameInput(true);
    }
  }, []);

  // Update presence every 15 seconds
  useEffect(() => {
    if (!userName) return;

    const updateUserPresence = () => {
      updatePresence({ 
        name: userName, 
        oldName: previousUserName !== userName ? previousUserName : undefined 
      });
    };

    updateUserPresence(); // Initial update
    const interval = setInterval(updateUserPresence, 15000);

    return () => clearInterval(interval);
  }, [userName, previousUserName, updatePresence]);

  // Show notifications for new activities
  useEffect(() => {
    if (!recentActivities || recentActivities.length === 0) return;

    const newActivities = recentActivities.slice(0, recentActivities.length - lastActivityCount);
    
    newActivities.forEach((activity) => {
      // Show notification to all users (including the one who clicked)
      toast.success(`${activity.userName} recorded a new question`);
    });

    setLastActivityCount(recentActivities.length);
  }, [recentActivities, lastActivityCount]);

  const handleNameSubmit = (name: string) => {
    if (userName && userName !== name) {
      setPreviousUserName(userName); // Store the old name for cleanup
    }
    setUserName(name);
    localStorage.setItem("dumbQuestionsUserName", name);
    setShowNameInput(false);
  };

  const handleIncrement = async () => {
    if (!userName) return;
    
    await incrementCounters({ userName });
    toast.success("Question count increased successfully");
  };

  const handleChangeName = () => {
    setShowNameInput(true);
  };

  const handleResetCounters = async () => {
    if (!userName || userName !== "Matt") return;
    await resetCounters();
    toast.success("All counters reset successfully!");
  };

  const toggleDebugPanel = () => {
    setShowDebugPanel(!showDebugPanel);
  };

  if (showNameInput) {
    return <NameInput onSubmit={handleNameSubmit} currentName={userName} />;
  }

  return (
    <div className="space-y-10">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CounterCard
          title="Today's Count"
          count={counters?.dailyCount ?? 0}
          subtitle="Resets daily at midnight"
          gradient="from-blue-500 to-blue-600"
        />
        <CounterCard
          title="Total Count"
          count={counters?.totalCount ?? 0}
          subtitle="All-time cumulative total"
          gradient="from-slate-600 to-slate-700"
        />
      </div>

      {/* Primary Action */}
      <div className="text-center">
        <button
          onClick={handleIncrement}
          className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out"
        >
          <span className="relative z-10">Record a Dumb Question</span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">Current User</h3>
            <p className="text-slate-600 font-medium">{userName}</p>
          </div>
          <div className="flex gap-3">
            {userName === "Matt" && (
              <button
                onClick={toggleDebugPanel}
                className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors duration-200 border border-orange-200"
              >
                {showDebugPanel ? "Hide Debug" : "Show Debug"}
              </button>
            )}
            <button
              onClick={handleChangeName}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors duration-200 border border-slate-200"
            >
              Update Name
            </button>
          </div>
        </div>
      </div>

      {/* Online Users */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">
          Active Users ({onlineUsers?.length ?? 0})
        </h3>
        <div className="flex flex-wrap gap-3">
          {onlineUsers?.map((user) => (
            <span
              key={user._id}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              {user.name}
            </span>
          ))}
          {(!onlineUsers || onlineUsers.length === 0) && (
            <p className="text-slate-500 italic">No other users currently online</p>
          )}
        </div>
      </div>

      {/* Debug Section - Only visible to Matt and at the bottom */}
      {userName === "Matt" && showDebugPanel && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 shadow-lg">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-red-800">🔧 Debug Panel</h3>
            <p className="text-red-600 text-sm">This section is only visible to Matt</p>
            <button
              onClick={handleResetCounters}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors duration-200"
            >
              Reset All Counters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CounterCard({ title, count, subtitle, gradient }: {
  title: string;
  count: number;
  subtitle: string;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        <div className={`text-5xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {count.toLocaleString()}
        </div>
        <p className="text-slate-500 text-sm font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

function NameInput({ onSubmit, currentName }: {
  onSubmit: (name: string) => void;
  currentName: string;
}) {
  const [name, setName] = useState(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-100 max-w-md mx-auto">
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold text-slate-800">
          {currentName ? "Update Your Name" : "Welcome to IdioQ"}
        </h2>
        <p className="text-slate-600">
          {currentName ? "Enter your new name below" : "Please enter your name to get started"}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg transition-all duration-200"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none"
        >
          {currentName ? "Update Name" : "Get Started"}
        </button>
      </form>
    </div>
  );
}
