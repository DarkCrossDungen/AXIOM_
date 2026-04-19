import google.generativeai as genai
import os
from typing import List, Dict, Any

class SocialAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def suggest_content(self, niche: str, style_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generates 3-5 social media post suggestions based on the user's niche and style.
        """
        prompt = f"""
        Generate 3 diverse social media post concepts for the niche: "{niche}".
        Use this style context: {style_context}
        
        For each concept, provide:
        - platform (Twitter, LinkedIn, or Instagram)
        - content_text (The actual post copy with a hook and CTA)
        - media_prompt (Detailed prompt for an image or video generation)
        - hash_tags (List of relevant tags)
        
        Return the result as a JSON array of objects.
        """
        
        try:
            response = self.model.generate_content(prompt)
            import json, re
            match = re.search(r'\[.*\]', response.text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            return [{"error": "Parsing failed", "raw": response.text}]
        except Exception as e:
            return [{"error": str(e)}]

def get_social_agent():
    key = os.getenv("GEMINI_KEY_2") or os.getenv("GEMINI_KEY_1")
    return SocialAgent(key)
