// pages/api/trends.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch Google Trends data
    const trendsData = await fetchGoogleTrends();
    
    // Fetch related news for each trend
    const newsData = await fetchRelatedNews(trendsData);
    
    res.status(200).json({
      trends: trendsData,
      newsArticles: newsData,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trends',
      trends: getMockTrends(), // Fallback to mock data
      newsArticles: {}
    });
  }
}

async function fetchGoogleTrends() {
  // For now, return mock data. In production, you'd call Google Trends API
  // const response = await fetch(`https://trends.googleapis.com/trends/api/dailytrends?hl=en&tz=300&geo=US&ns=15&key=${process.env.GOOGLE_TRENDS_API_KEY}`);
  
  return getMockTrends();
}

async function fetchRelatedNews(trends) {
  const newsArticles = {};
  
  for (const trend of trends) {
    try {
      // Call NewsAPI for each trend
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(trend.topic)}&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        newsArticles[trend.topic] = data.articles?.slice(0, 3) || [];
      }
    } catch (error) {
      console.error(`Error fetching news for ${trend.topic}:`, error);
      newsArticles[trend.topic] = [];
    }
  }
  
  return newsArticles;
}

function getMockTrends() {
  return [
    {
      topic: 'Tech CEO Layoffs',
      trendValue: 95,
      relatedQueries: ['Elon Musk layoffs', 'Meta layoffs', 'tech recession'],
      sentiment: 'negative',
      newsCount: 45,
      region: 'US'
    },
    {
      topic: 'Celebrity Legal Issues',
      trendValue: 78,
      relatedQueries: ['celebrity lawsuit', 'court case', 'legal drama'],
      sentiment: 'negative',
      newsCount: 32,
      region: 'Global'
    },
    {
      topic: 'Political Controversy',
      trendValue: 89,
      relatedQueries: ['scandal', 'investigation', 'political drama'],
      sentiment: 'negative',
      newsCount: 67,
      region: 'US'
    },
    {
      topic: 'Social Media Drama',
      trendValue: 71,
      relatedQueries: ['Twitter controversy', 'social media backlash', 'cancel culture'],
      sentiment: 'negative',
      newsCount: 28,
      region: 'Global'
    }
  ];
}