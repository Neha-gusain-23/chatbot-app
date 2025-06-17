export interface ChatAnalytics {
  totalMessages: number;
  userMessages: number;
  botMessages: number;
  averageResponseTime: number;
  activeDays: number;
  messagesPerDay: number;
  popularTopics: { topic: string; count: number }[];
  hourlyActivity: { hour: number; count: number }[];
  weeklyActivity: { day: string; count: number }[];
  messageHistory: {
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    responseTime?: number;
  }[];
}

class AnalyticsTracker {
  private analytics: ChatAnalytics;
  private startTime: number = 0;

  constructor() {
    this.analytics = this.loadAnalytics();
  }

  private loadAnalytics(): ChatAnalytics {
    if (typeof window === 'undefined') {
      return this.getDefaultAnalytics();
    }

    const saved = localStorage.getItem('chatAnalytics');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        parsed.messageHistory = parsed.messageHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        return parsed;
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    }

    return this.getDefaultAnalytics();
  }

  private getDefaultAnalytics(): ChatAnalytics {
    return {
      totalMessages: 0,
      userMessages: 0,
      botMessages: 0,
      averageResponseTime: 0,
      activeDays: 0,
      messagesPerDay: 0,
      popularTopics: [],
      hourlyActivity: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
      weeklyActivity: [
        { day: 'Mon', count: 0 }, { day: 'Tue', count: 0 }, { day: 'Wed', count: 0 },
        { day: 'Thu', count: 0 }, { day: 'Fri', count: 0 }, { day: 'Sat', count: 0 },
        { day: 'Sun', count: 0 }
      ],
      messageHistory: []
    };
  }

  private saveAnalytics() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('chatAnalytics', JSON.stringify(this.analytics));
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }

  private updateActivityCharts() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.toLocaleDateString('en-US', { weekday: 'short' });

    // Update hourly activity
    this.analytics.hourlyActivity[hour].count++;

    // Update weekly activity
    const dayIndex = this.analytics.weeklyActivity.findIndex(d => d.day === day);
    if (dayIndex !== -1) {
      this.analytics.weeklyActivity[dayIndex].count++;
    }

    // Update active days
    const today = now.toDateString();
    const lastMessage = this.analytics.messageHistory[this.analytics.messageHistory.length - 2];
    if (!lastMessage || new Date(lastMessage.timestamp).toDateString() !== today) {
      this.analytics.activeDays++;
    }

    // Update messages per day
    this.analytics.messagesPerDay = this.analytics.totalMessages / Math.max(this.analytics.activeDays, 1);
  }

  private analyzeTopics(text: string) {
    const topics = [
      { topic: 'General Questions', keywords: ['hello', 'hi', 'how', 'what', 'when', 'where', 'why'] },
      { topic: 'Technical Support', keywords: ['help', 'support', 'problem', 'issue', 'error', 'bug'] },
      { topic: 'Code Help', keywords: ['code', 'programming', 'function', 'class', 'variable', 'loop'] },
      { topic: 'Writing Assistance', keywords: ['write', 'email', 'letter', 'document', 'essay', 'report'] },
      { topic: 'Math Problems', keywords: ['math', 'calculate', 'equation', 'solve', 'number'] },
      { topic: 'Creative Writing', keywords: ['story', 'creative', 'imagine', 'fiction', 'poem'] },
      { topic: 'Language Learning', keywords: ['language', 'translate', 'grammar', 'vocabulary', 'speak'] },
      { topic: 'Travel Planning', keywords: ['travel', 'trip', 'vacation', 'hotel', 'flight', 'destination'] },
      { topic: 'Health Advice', keywords: ['health', 'medical', 'diet', 'exercise', 'symptoms'] }
    ];

    const lowerText = text.toLowerCase();
    for (const topic of topics) {
      if (topic.keywords.some(keyword => lowerText.includes(keyword))) {
        const existingTopic = this.analytics.popularTopics.find(t => t.topic === topic.topic);
        if (existingTopic) {
          existingTopic.count++;
        } else {
          this.analytics.popularTopics.push({ topic: topic.topic, count: 1 });
        }
        break;
      }
    }

    // Sort topics by count
    this.analytics.popularTopics.sort((a, b) => b.count - a.count);
  }

  startMessage() {
    this.startTime = Date.now();
  }

  addUserMessage(text: string) {
    const timestamp = new Date();
    
    this.analytics.userMessages++;
    this.analytics.totalMessages++;
    this.analytics.messageHistory.push({
      text,
      sender: 'user',
      timestamp
    });

    this.analyzeTopics(text);
    this.updateActivityCharts();
    this.saveAnalytics();
  }

  addBotMessage(text: string) {
    const timestamp = new Date();
    const responseTime = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;
    
    this.analytics.botMessages++;
    this.analytics.totalMessages++;
    this.analytics.messageHistory.push({
      text,
      sender: 'bot',
      timestamp,
      responseTime
    });

    // Update average response time
    const totalResponseTime = this.analytics.messageHistory
      .filter(msg => msg.responseTime)
      .reduce((sum, msg) => sum + (msg.responseTime || 0), 0);
    const responseCount = this.analytics.messageHistory.filter(msg => msg.responseTime).length;
    this.analytics.averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;

    this.updateActivityCharts();
    this.saveAnalytics();
  }

  getAnalytics(): ChatAnalytics {
    return { ...this.analytics };
  }

  resetAnalytics() {
    this.analytics = this.getDefaultAnalytics();
    this.saveAnalytics();
  }
}

// Create a singleton instance
export const analyticsTracker = new AnalyticsTracker(); 