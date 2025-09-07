export default async function handler(req, res) {
  console.log('=== API GENERATE CALLED ===');
  console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { trend } = req.body;

    if (!trend) {
      return res.status(400).json({ error: 'Trend data is required' });
    }

    // Try to call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `You are a maverick brand strategist. Create a Twitter thread that flips "${trend.topic}" into positive brand strategy. Start with "🚨 BREAKING: While everyone's focusing on ${trend.topic}, here's the HIDDEN brand strategy lesson worth MILLIONS..." Write 6 tweets in thread format with bold words, emojis, and actionable steps. End with #BrandStrategy #Entrepreneurship #Marketing`
          }
        ]
      })
    });

    const data = await response.json();
console.log('Claude API Response Status:', response.status);
console.log('Claude API Response:', JSON.stringify(data, null, 2));
    
    if (data.content && data.content[0]) {
      console.log('SUCCESS: Got response from Claude');
      res.status(200).json({
        content: data.content[0].text,
        trend: trend.topic,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Invalid response from Claude');
    }

  } catch (error) {
    console.error('Claude API Error:', error);
    
    // Fallback content
    const fallbackContent = `🚨 BREAKING: While everyone's focusing on the ${req.body.trend?.topic} drama, here's the HIDDEN brand strategy lesson that's worth MILLIONS...

A THREAD 🧵 (1/6)

1/ The internet is going CRAZY over this situation...

But while critics focus on the chaos, smart entrepreneurs see the REAL opportunity: FREE ATTENTION = BUSINESS GOLD 💰

2/ Here's what most business owners miss:

Every controversy teaches us about:
→ Crisis management
→ Authentic communication  
→ Standing out from competitors

3/ The Brand Flip Strategy:
❌ Traditional: Hide from drama
✅ Maverick Move: LEARN from the situation

Bold voices get heard in noisy markets 📈

4/ Your action plan:
→ Monitor industry hot topics
→ Find the business lesson
→ Share your authentic take
→ Let courage drive content

5/ Remember: Visibility beats perfection

While others play it safe, YOU can dominate by being REAL

6/ What controversial topic in YOUR industry could become brand gold?

Drop your thoughts 👇

#BrandStrategy #Entrepreneurship #Marketing`;

    res.status(200).json({
      content: fallbackContent,
      trend: req.body.trend?.topic || 'Unknown',
      timestamp: new Date().toISOString(),
      source: 'fallback'
    });
  }
}