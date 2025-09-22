import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

export async function generateBlogContent(prompt: string): Promise<string> {
  try {
    const model = (genAI as any).getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const enhancedPrompt = `You are a professional content writer. Create a comprehensive, well-structured blog post based on the following topic or prompt. Include an engaging introduction, detailed body sections with subheadings, and a compelling conclusion. Use markdown formatting for better readability.

Topic/Prompt: ${prompt}

Please write a complete blog post that is informative, engaging, and professionally written.`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    return response.text() || "Failed to generate content";
  } catch (error) {
    console.error("Error generating blog content:", error);
    throw new Error("Failed to generate blog content");
  }
}

export async function generateContentIdeas(topic: string, type: string = "general"): Promise<string[]> {
  try {
    const model = (genAI as any).getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `Generate 10 creative and engaging content ideas for the topic "${topic}" in the category of "${type}". 
    Return the ideas as a simple numbered list, one idea per line. Make the ideas specific, actionable, and appealing to a target audience.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text() || "";
    
    // Parse the response into an array of ideas
    const ideas = text
      .split('\n')
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((line: string) => line.length > 0);
    
    return ideas.slice(0, 10); // Ensure we return max 10 ideas
  } catch (error) {
    console.error("Error generating content ideas:", error);
    throw new Error("Failed to generate content ideas");
  }
}

export async function chatWithAI(message: string): Promise<string> {
  try {
    const model = (genAI as any).getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const enhancedPrompt = `You are a helpful AI assistant for InfinityHub, a comprehensive digital platform for creators and entrepreneurs. 
    You help users with content creation, business advice, creative ideas, and general questions about using the platform.
    
    Please provide a helpful, friendly, and informative response to the following message:
    
    ${message}`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    return response.text() || "I'm sorry, I couldn't process your request right now.";
  } catch (error) {
    console.error("Error in AI chat:", error);
    throw new Error("Failed to process AI chat");
  }
}

export async function improveBlogContent(content: string): Promise<string> {
  try {
    const model = (genAI as any).getGenerativeModel({ model: "gemini-2.5-pro" });
    
    const prompt = `You are a professional editor and content strategist. Please improve the following blog content by:
    1. Enhancing clarity and readability
    2. Improving structure and flow
    3. Adding engaging elements where appropriate
    4. Ensuring proper grammar and style
    5. Maintaining the original intent and message
    
    Original content:
    ${content}
    
    Please return the improved version with markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || content; // Return original if generation fails
  } catch (error) {
    console.error("Error improving blog content:", error);
    throw new Error("Failed to improve blog content");
  }
}

export async function generateGigIdeas(skills: string, category: string = "general"): Promise<string[]> {
  try {
    const model = (genAI as any).getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `Based on the skills "${skills}" in the "${category}" category, generate 8 specific freelance gig ideas that someone could offer on a platform like Fiverr or Upwork. 
    
    For each gig idea, provide:
    1. A clear, specific service title
    2. Brief description of what's included
    
    Format each as: "Title - Description"
    Make the gigs realistic, in-demand, and something that can be delivered digitally.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text() || "";
    
    // Parse the response into an array of gig ideas
    const ideas = text
      .split('\n')
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((line: string) => line.length > 0 && line.includes('-'));
    
    return ideas.slice(0, 8); // Ensure we return max 8 ideas
  } catch (error) {
    console.error("Error generating gig ideas:", error);
    throw new Error("Failed to generate gig ideas");
  }
}
