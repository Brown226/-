import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Safely initialize GenAI only if key exists, otherwise we handle errors gracefully in UI
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const geminiService = {
  /**
   * Generates a professional changelog or description based on raw input.
   */
  enhanceText: async (rawText: string, type: 'changelog' | 'description'): Promise<string> => {
    if (!ai) {
      throw new Error("未配置 API 密钥，无法使用 AI 功能");
    }

    const model = "gemini-2.5-flash";
    
    let prompt = "";
    if (type === 'changelog') {
      prompt = `
        你是一个软件开发团队的技术文档专家。
        请将以下原始笔记重写为一份专业、简洁的中文软件更新日志（使用无序列表格式）。
        请保持语言简练，适合开发人员阅读。
        
        原始笔记: "${rawText}"
      `;
    } else {
      prompt = `
        你是一个产品经理。
        请将以下工具描述重写为一段引人入胜、清晰的中文介绍，重点突出它对开发者的价值。
        请保持在3句话以内。

        原始描述: "${rawText}"
      `;
    }

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      return response.text || rawText;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("AI 服务请求失败，请稍后重试");
    }
  }
};