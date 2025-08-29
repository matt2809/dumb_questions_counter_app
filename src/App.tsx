import { useState, useEffect } from "react";
import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-indigo-600">Dumb Questions Counter</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-indigo-600 mb-4">🤔 Dumb Questions Counter</h1>
        <Authenticated>
          <p className="text-xl text-gray-600">
            Welcome back, {(loggedInUser as any)?.email ?? "friend"}!
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-gray-600">Sign in to start counting dumb questions</p>
        </Unauthenticated>
      </div>

      <Authenticated>
        <DumbQuestionsApp />
      </Authenticated>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </div>
  );
}

function DumbQuestionsApp() {
  const [userName, setUserName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [lastActivityCount, setLastActivityCount] = useState(0);

  const counters = useQuery(api.counters.getCounters);
  const onlineUsers = useQuery(api.users.getOnlineUsers);
  const recentActivities = useQuery(api.counters.getRecentActivities);
  
  const incrementCounters = useMutation(api.counters.incrementCounters);
  const updatePresence = useMutation(api.users.updatePresence);

  // Load username from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("dumbQuestionsUserName");
    if (savedName) {
      setUserName(savedName);
    } else {
      setShowNameInput(true);
    }
  }, []);

  // Update presence every 15 seconds
  useEffect(() => {
    if (!userName) return;

    const updateUserPresence = () => {
      updatePresence({ name: userName });
    };

    updateUserPresence(); // Initial update
    const interval = setInterval(updateUserPresence, 15000);

    return () => clearInterval(interval);
  }, [userName, updatePresence]);

  // Show notifications for new activities
  useEffect(() => {
    if (!recentActivities || recentActivities.length === 0) return;

    const newActivities = recentActivities.slice(0, recentActivities.length - lastActivityCount);
    
    newActivities.forEach((activity) => {
      if (activity.userName !== userName) {
        toast.success(`${activity.userName} increased the dumb question count! 🤦‍♂️`);
      }
    });

    setLastActivityCount(recentActivities.length);
  }, [recentActivities, userName, lastActivityCount]);

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    localStorage.setItem("dumbQuestionsUserName", name);
    setShowNameInput(false);
  };

  const handleIncrement = async () => {
    if (!userName) return;
    
    await incrementCounters({ userName });
    toast.success("You increased the dumb question count! 🤦‍♂️");
  };

  const handleChangeName = () => {
    setShowNameInput(true);
  };

  if (showNameInput) {
    return <NameInput onSubmit={handleNameSubmit} currentName={userName} />;
  }

  return (
    <div className="space-y-8">
      {/* Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CounterCard
          title="Dumb Questions Today"
          count={counters?.dailyCount ?? 0}
          icon="📅"
          subtitle="Resets at midnight"
        />
        <CounterCard
          title="Total Dumb Questions Ever"
          count={counters?.totalCount ?? 0}
          icon="🏆"
          subtitle="All-time record"
        />
      </div>

      {/* Increment Button */}
      <div className="text-center">
        <button
          onClick={handleIncrement}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          I Asked a Dumb Question! 🤦‍♂️
        </button>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Current User</h3>
            <p className="text-gray-600">{userName}</p>
          </div>
          <button
            onClick={handleChangeName}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
          >
            Change Name
          </button>
        </div>
      </div>

      {/* Online Users */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Online Users ({onlineUsers?.length ?? 0})
        </h3>
        <div className="flex flex-wrap gap-2">
          {onlineUsers?.map((user) => (
            <span
              key={user._id}
              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {user.name}
            </span>
          ))}
          {(!onlineUsers || onlineUsers.length === 0) && (
            <p className="text-gray-500">No one else is online right now</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CounterCard({ title, count, icon, subtitle }: {
  title: string;
  count: number;
  icon: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">{title}</h2>
      <div className="text-4xl font-bold text-indigo-600 mb-2">{count.toLocaleString()}</div>
      <p className="text-gray-500 text-sm">{subtitle}</p>
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
    <div className="bg-white rounded-lg p-8 shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        {currentName ? "Change Your Name" : "What's Your Name?"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          autoFocus
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-md transition-colors"
        >
          {currentName ? "Update Name" : "Start Counting!"}
        </button>
      </form>
    </div>
  );
}
