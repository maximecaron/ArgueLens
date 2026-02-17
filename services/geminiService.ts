import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, AnnotationType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  // Switched to Flash for faster response times while maintaining high quality analysis
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the following argumentative text. 
    Identify the key components of the argument: Claims, Evidence, Reasoning, and Counterarguments.
    
    Return a JSON object with a list of annotations. 
    
    IMPORTANT REQUIREMENTS:
    1. Assign a unique "id" to every annotation (e.g., "c1", "e1", "r1", "ca1").
    2. Extract the "quote" exactly as it appears in the text.
    3. Categorize by "type": Claim, Evidence, Reasoning, or Counterargument.
    4. Provide a 1-sentence "explanation" of what this part represents.
    
    For EVIDENCE annotations, also include:
    - "evidence_type": One of "fact", "statistic", "example", "expert_testimony", "anecdote", "other".
    - "source_credibility": "high", "medium", "low", "unknown".

    For REASONING, EVIDENCE, and COUNTERARGUMENT annotations, you MUST include:
    - "supported_claim_ids": A list of Claim IDs that this segment supports.
    - "supported_evidence_ids": A list of Evidence IDs that this segment relies on or supports.
    - "is_logically_valid": true or false.
    - "invalid_logic_explanation": If "is_logically_valid" is false, provide a clear explanation of why the logic is flawed. If valid, leave empty.
    - "bias_indicators": A list of potential biases (id, type, text, severity). ALWAYS return this list (empty if none found).
      Bias types: "emotionally_charged_language", "one_sidedness", "omission", "cherry_picking", "lack_of_sources", "other".
    - "logical_fallacies": A list of logical fallacies (id, fallacy_type, text, severity). ALWAYS return this list (empty if none found).
      Fallacy types: "ad_hominem", "straw_man", "slippery_slope", "red_herring", "false_cause", "overgeneralization", "other".

    Text to analyze:
    "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            annotations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  quote: { type: Type.STRING },
                  type: { 
                    type: Type.STRING, 
                    enum: [
                      AnnotationType.CLAIM, 
                      AnnotationType.EVIDENCE, 
                      AnnotationType.REASONING,
                      AnnotationType.COUNTERARGUMENT
                    ] 
                  },
                  explanation: { type: Type.STRING },
                  
                  // Evidence specific
                  evidence_type: { 
                    type: Type.STRING,
                    enum: ["fact", "statistic", "example", "expert_testimony", "anecdote", "other"]
                  },
                  source_credibility: {
                    type: Type.STRING,
                    enum: ["high", "medium", "low", "unknown"]
                  },

                  // Shared analysis fields
                  supported_claim_ids: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  supported_evidence_ids: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  is_logically_valid: { type: Type.BOOLEAN },
                  invalid_logic_explanation: { type: Type.STRING },
                  
                  bias_indicators: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        type: { 
                          type: Type.STRING,
                          enum: ["emotionally_charged_language", "one_sidedness", "omission", "cherry_picking", "lack_of_sources", "other"]
                        },
                        text: { type: Type.STRING },
                        severity: { 
                          type: Type.STRING,
                          enum: ["low", "medium", "high"]
                        }
                      },
                      required: ["id", "type", "text", "severity"]
                    }
                  },

                  logical_fallacies: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        fallacy_type: { 
                          type: Type.STRING,
                          enum: ["ad_hominem", "straw_man", "slippery_slope", "red_herring", "false_cause", "overgeneralization", "other"]
                        },
                        text: { type: Type.STRING },
                        severity: { 
                          type: Type.STRING,
                          enum: ["low", "medium", "high"]
                        }
                      },
                      required: ["id", "fallacy_type", "text", "severity"]
                    }
                  }
                },
                required: ["id", "quote", "type", "explanation"]
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response received from Gemini.");
    }

    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing text:", error);
    throw error;
  }
};