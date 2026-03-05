const { GoogleGenAI } = require('@google/genai');
const { User } = require('../models');

// Initialize Gemini AI
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

// Token costs
const TOKEN_COSTS = {
  image_generation: 10,
  video_generation: 50,
  text_generation: 1
};

// @desc    Generate image
// @route   POST /api/ai/generate-image
// @access  Private
const generateImage = async (req, res) => {
  try {
    const { prompt, config } = req.body;
    const user = req.user;

    // Check if user has enough tokens
    const tokenCost = TOKEN_COSTS.image_generation;
    if (!user.hasEnoughTokens(tokenCost)) {
      return res.status(402).json({
        message: 'Insufficient tokens',
        required: tokenCost,
        available: user.tokens.available
      });
    }

    const ai = getAIClient();
    
    // Process the request
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio || '1:1',
          imageSize: "2K"
        }
      }
    });

    // Find the generated image
    let imageUrl = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    // Deduct tokens
    await user.useTokens(tokenCost, 'image_generation', {
      prompt: prompt.substring(0, 100),
      aspectRatio: config.aspectRatio
    });

    res.json({
      success: true,
      imageUrl,
      tokensUsed: tokenCost,
      remainingTokens: user.tokens.available - tokenCost
    });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ message: 'Failed to generate image' });
  }
};

// @desc    Generate video
// @route   POST /api/ai/generate-video
// @access  Private
const generateVideo = async (req, res) => {
  try {
    const { imageUrl, prompt, ratio } = req.body;
    const user = req.user;

    // Check if user has enough tokens
    const tokenCost = TOKEN_COSTS.video_generation;
    if (!user.hasEnoughTokens(tokenCost)) {
      return res.status(402).json({
        message: 'Insufficient tokens',
        required: tokenCost,
        available: user.tokens.available
      });
    }

    const ai = getAIClient();
    
    // Extract base64 data from image URL
    const base64Data = imageUrl.split(';base64,')[1];
    const mimeType = imageUrl.match(/^data:(.*);base64,/)[1];

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "Cinematic showcase",
      image: { imageBytes: base64Data, mimeType: mimeType },
      config: { 
        numberOfVideos: 1, 
        resolution: '720p', 
        aspectRatio: ratio || '16:9' 
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUrl = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUrl) {
      throw new Error('No video generated');
    }

    // Deduct tokens
    await user.useTokens(tokenCost, 'video_generation', {
      prompt: prompt?.substring(0, 100) || 'Cinematic showcase',
      aspectRatio: ratio
    });

    res.json({
      success: true,
      videoUrl: `${videoUrl}&key=${process.env.GEMINI_API_KEY}`,
      tokensUsed: tokenCost,
      remainingTokens: user.tokens.available - tokenCost
    });

  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ message: 'Failed to generate video' });
  }
};

// @desc    Generate text content
// @route   POST /api/ai/generate-text
// @access  Private
const generateText = async (req, res) => {
  try {
    const { prompt, type } = req.body;
    const user = req.user;

    // Check if user has enough tokens
    const tokenCost = TOKEN_COSTS.text_generation;
    if (!user.hasEnoughTokens(tokenCost)) {
      return res.status(402).json({
        message: 'Insufficient tokens',
        required: tokenCost,
        available: user.tokens.available
      });
    }

    const ai = getAIClient();
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    const generatedText = response.text;

    // Deduct tokens
    await user.useTokens(tokenCost, 'text_generation', {
      prompt: prompt.substring(0, 100),
      type: type || 'general'
    });

    res.json({
      success: true,
      text: generatedText,
      tokensUsed: tokenCost,
      remainingTokens: user.tokens.available - tokenCost
    });

  } catch (error) {
    console.error('Text generation error:', error);
    res.status(500).json({ message: 'Failed to generate text' });
  }
};

// @desc    Get user token balance
// @route   GET /api/ai/balance
// @access  Private
const getTokenBalance = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['tokens_available', 'tokens_used', 'tokens_total_purchased']
    });
    
    res.json({
      success: true,
      balance: {
        available: user.tokens_available,
        used: user.tokens_used,
        totalPurchased: user.tokens_total_purchased
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  generateImage,
  generateVideo,
  generateText,
  getTokenBalance
};