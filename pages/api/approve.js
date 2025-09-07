// pages/api/approve.js
import { TwitterApi } from 'twitter-api-v2';

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id, content, immediate = false } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (immediate) {
      // Post immediately to Twitter
      const result = await postToTwitter(content);
      return res.status(200).json({
        success: true,
        posted: true,
        tweetId: result.tweetId,
        message: 'Posted successfully to Twitter'
      });
    } else {
      // Schedule for later (you could integrate with a job queue here)
      // For now, just save to Google Drive and return success
      await saveToGoogleDrive(content);
      
      return res.status(200).json({
        success: true,
        scheduled: true,
        message: 'Post approved and scheduled'
      });
    }

  } catch (error) {
    console.error('Error approving post:', error);
    res.status(500).json({ 
      error: 'Failed to approve post',
      details: error.message 
    });
  }
}

async function postToTwitter(content) {
  try {
    // Split content into individual tweets (by numbered format)
    const tweets = content
      .split(/\d+\/\d+/)
      .map(tweet => tweet.trim())
      .filter(tweet => tweet.length > 0)
      .map(tweet => tweet.replace(/^\d+\/.*?\n/, '').trim());

    if (tweets.length === 0) {
      throw new Error('No valid tweets found in content');
    }

    // Post the first tweet
    const firstTweet = await twitterClient.v2.tweet(tweets[0]);
    let previousTweetId = firstTweet.data.id;

    // Post subsequent tweets as replies (thread)
    for (let i = 1; i < tweets.length; i++) {
      if (tweets[i].length > 0) {
        const reply = await twitterClient.v2.reply(tweets[i], previousTweetId);
        previousTweetId = reply.data.id;
      }
    }

    return {
      success: true,
      tweetId: firstTweet.data.id,
      threadLength: tweets.length
    };

  } catch (error) {
    console.error('Twitter posting error:', error);
    throw new Error(`Failed to post to Twitter: ${error.message}`);
  }
}

async function saveToGoogleDrive(content) {
  try {
    // This is a placeholder for Google Drive integration
    // You would implement actual Google Drive API calls here
    console.log('Saving to Google Drive:', content.substring(0, 100) + '...');
    
    // For now, just log it (in production, save to Google Drive)
    return { success: true };
    
  } catch (error) {
    console.error('Google Drive error:', error);
    throw new Error(`Failed to save to Google Drive: ${error.message}`);
  }
}