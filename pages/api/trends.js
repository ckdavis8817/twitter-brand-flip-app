// pages/api/trends.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('=== TRENDS API CALLED ===');
    console.log('NEWS_API_KEY exists:', !!process.env.NEWS_API_KEY);
    
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
  console.log('=== FETCHING NEWS FOR TRENDS ===');
  console.log('NEWS_API_KEY exists:', !!process.env.NEWS_API_KEY);
  console.log('NEWS_API_KEY length:', process.env.NEWS_API_KEY?.length || 0);
  
  const newsArticles = {};
  
  for (const trend of trends) {
    try {
      console.log(`Calling News API for: "${trend.topic}"`);
      
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(trend.topic)}&sortBy=publishedAt&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`;
      console.log('News API URL:', url.replace(process.env.NEWS_API_KEY, 'API_KEY_HIDDEN'));
      
      // Call NewsAPI for each trend
      const response = await fetch(url);
      
      console.log(`News API response status for "${trend.topic}":`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`News API returned ${data.articles?.length || 0} articles for "${trend.topic}"`);
        
        if (data.articles && data.articles.length > 0) {
          newsArticles[trend.topic] = data.articles.slice(0, 3);
          console.log(`First article title: "${data.articles[0]?.title}"`);
        } else {
          console.log(`No articles found for "${trend.topic}"`);
          newsArticles[trend.topic] = [];
        }
      } else {
        const errorText = await response.text();
        console.log(`News API error for "${trend.topic}":`, response.status, response.statusText);
        console.log('Error response:', errorText);
        newsArticles[trend.topic] = [];
      }
    } catch (error) {
      console.error(`Error fetching news for ${trend.topic}:`, error);
      newsArticles[trend.topic] = [];
    }
    
    // Add small delay between API calls to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('=== NEWS FETCH COMPLETE ===');
  console.log('Topics with articles:', Object.keys(newsArticles).filter(topic => newsArticles[topic].length > 0));
  
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