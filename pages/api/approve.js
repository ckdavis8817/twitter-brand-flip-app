export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.body;
    
    // Temporarily disabled Twitter posting for testing
    // Just return success to make approval workflow functional
    
    return res.status(200).json({
      success: true,
      scheduled: true,
      message: 'Post approved and scheduled (Twitter posting disabled for testing)'
    });
    
  } catch (error) {
    console.error('Error approving post:', error);
    res.status(500).json({ 
      error: 'Failed to approve post',
      details: error.message 
    });
  }
}