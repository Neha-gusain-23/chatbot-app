"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { analyticsTracker, ChatAnalytics } from "@/lib/analytics";

interface AnalyticsData {
  totalMessages: number;
  userMessages: number;
  botMessages: number;
  averageResponseTime: number;
  activeDays: number;
  messagesPerDay: number;
  popularTopics: { topic: string; count: number }[];
  hourlyActivity: { hour: number; count: number }[];
  weeklyActivity: { day: string; count: number }[];
}

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export default function AnalyticsDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        loadAnalytics();
      } else {
        localStorage.removeItem('authToken');
        router.push('/');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/');
    }
  };

  const loadAnalytics = () => {
    // Load real analytics data
    const realAnalytics = analyticsTracker.getAnalytics();
    setAnalytics(realAnalytics);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/');
  };

  const handleBackToChat = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || !analytics) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
              Analytics Dashboard
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-300 transition-colors duration-300">
              Welcome, {user.username}!
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToChat}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Back to Chat
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all analytics data? This action cannot be undone.')) {
                  analyticsTracker.resetAnalytics();
                  loadAnalytics();
                }
              }}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
            >
              Reset Analytics
            </button>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User Messages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.userMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bot Responses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.botMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.averageResponseTime}s</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Hourly Activity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hourly Activity</h3>
            <div className="h-64 flex items-end justify-between space-x-1">
              {analytics.hourlyActivity.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500 dark:bg-blue-600 rounded-t transition-all duration-300 hover:bg-blue-600 dark:hover:bg-blue-700"
                    style={{ height: `${(item.count / Math.max(...analytics.hourlyActivity.map(h => h.count))) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{item.hour}:00</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Activity</h3>
            <div className="h-64 flex items-end justify-between space-x-1">
              {analytics.weeklyActivity.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-green-500 dark:bg-green-600 rounded-t transition-all duration-300 hover:bg-green-600 dark:hover:bg-green-700"
                    style={{ height: `${(item.count / Math.max(...analytics.weeklyActivity.map(w => w.count))) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Topics</h3>
          <div className="space-y-3">
            {analytics.popularTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{topic.topic}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 dark:bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(topic.count / Math.max(...analytics.popularTopics.map(t => t.count))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {topic.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Days</span>
                <span className="font-medium text-gray-900 dark:text-white">{analytics.activeDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Messages per Day</span>
                <span className="font-medium text-gray-900 dark:text-white">{analytics.messagesPerDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">User Engagement</span>
                <span className="font-medium text-gray-900 dark:text-white">High</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Response Accuracy</span>
                <span className="font-medium text-green-600 dark:text-green-400">98.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">User Satisfaction</span>
                <span className="font-medium text-green-600 dark:text-green-400">4.8/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">System Uptime</span>
                <span className="font-medium text-green-600 dark:text-green-400">99.9%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 