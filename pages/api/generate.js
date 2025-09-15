export default async function handler(req, res) {
  console.log('=== API GENERATE CALLED ===');
  console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
  console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length || 0);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { trend, newsContext } = req.body;

    if (!trend) {
      return res.status(400).json({ error: 'Trend data is required' });
    }

    console.log('Trend received:', trend.topic);
    console.log('News articles received:', newsContext?.length || 0);

    // Prepare news headlines for Claude
    const newsHeadlines = newsContext?.map(article => `- ${article.title}`).join('\n') || '';
    console.log('News headlines for Claude:', newsHeadlines.substring(0, 200) + '...');
    
    const prompt = `You are a maverick brand strategist with a tabloid-style edge. Your job is to flip current negative news into positive brand strategy insights.

TRENDING TOPIC: ${trend.topic}
CURRENT NEWS HEADLINES:
${newsHeadlines}

Your mission: Create a Twitter thread that references these SPECIFIC current headlines and transforms them into GENIUS brand strategy lessons. 

Requirements:
- Start with "🚨 BREAKING: While everyone's [talking about specific current event from headlines], here's the HIDDEN [positive lesson] that's worth MILLIONS..."
- Reference the actual news headlines, not generic topics
- Write 6-7 tweets in thread format (1/6, 2/6, etc.)
- Use maverick + tabloid energy: BOLD words, emojis, contrarian takes
- Focus on authentic business lessons entrepreneurs can use from these real events
- Include actionable steps based on the current situation
- End with engagement question about the specific news
- Always end the thread with: "Want to master the Maverick approach to personal branding? Join the waitlist: https://seriodesignfx.com"
- Use hashtags: #BrandStrategy #Entrepreneurship #Marketing

Write the complete thread referencing these real current headlines:`;

    console.log('Making Claude API request...');
    console.log('Model:', 'claude-3-sonnet-20240229');
    console.log('Max tokens:', 1000);

    // Try to call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    console.log('Claude API response status:', response.status);
    console.log('Claude API response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Claude API full response:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.content && data.content[0]) {
      console.log('SUCCESS: Got response from Claude');
      console.log('Generated content preview:', data.content[0].text.substring(0, 100) + '...');
      
      res.status(200).json({
        content: data.content[0].text,
        trend: trend.topic,
        timestamp: new Date().toISOString(),
        newsHeadlinesUsed: newsContext?.map(article => article.title) || []
      });
    } else {
      console.log('Invalid Claude response structure or error response');
      console.log('Response ok:', response.ok);
      console.log('Has content array:', !!(data.content && data.content[0]));
      
      if (data.error) {
        console.log('Claude API error details:', data.error);
        throw new Error(`Claude API error: ${data.error.message || JSON.stringify(data.error)}`);
      } else {
        throw new Error(`Invalid response structure from Claude: ${JSON.stringify(data)}`);
      }
    }

  } catch (error) {
    console.error('Claude API Error:', error);
    console.error('Error stack:', error.stack);
    
    // Enhanced fallback content that uses news context if available
    const newsReference = req.body.newsContext && req.body.newsContext.length > 0 
      ? `the ${req.body.newsContext[0].title}` 
      : `the ${req.body.trend?.topic} drama`;
    
    const fallbackContent = `🚨 BREAKING: While everyone's focusing on ${newsReference}, here's the HIDDEN brand strategy lesson that's worth MILLIONS...

A THREAD 🧵 (1/6)

1/ The internet is going CRAZY over this situation...

But while critics focus on the chaos, smart entrepreneurs see the REAL opportunity: FREE ATTENTION = BUSINESS GOLD 💰

2/ Here's what most business owners miss:

Every major news story teaches us about:
→ Crisis management in real-time
→ Authentic communication under pressure
→ Standing out when competitors hide

3/ The Brand Flip Strategy:
❌ Traditional: Hide from industry drama
✅ Maverick Move: LEARN from the situation

Bold voices get heard in noisy markets 📈

4/ Your action plan based on current events:
→ Monitor how leaders handle this situation
→ Find the contrarian business angle
→ Share your authentic perspective
→ Let courage drive your content strategy

5/ Remember: In business, VISIBILITY beats perfection

While others play it safe, YOU can dominate by being REAL about industry challenges

6/ What lessons are you taking from this current situation for YOUR business strategy?

Drop your thoughts 👇

Want to master the Maverick approach to personal branding? Join the waitlist: https://seriodesignfx.com

#BrandStrategy #Entrepreneurship #Marketing`;

    res.status(200).json({
      content: fallbackContent,
      trend: req.body.trend?.topic || 'Unknown',
      timestamp: new Date().toISOString(),
      source: 'fallback',
      newsHeadlinesUsed: req.body.newsContext?.map(article => article.title) || [],
      error: error.message
    });
  }
}



