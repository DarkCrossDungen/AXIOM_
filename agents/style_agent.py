import google.generativeai as genai
import os
import json
import re
from typing import Dict, Any

class StyleAgent:
    def __init__(self, api_key: str):
        if api_key:
            genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def analyze_brand(self, source: str, is_url: bool = True) -> Dict[str, Any]:
        source_type = 'website URL' if is_url else 'image/text description'
        prompt = (
            f'Analyze the following {source_type}: {source}\n'
            'Extract the core Brand Identity Vector (BIV) in JSON format.\n'
            'Include:\n'
            '- primary_colors (list of hex codes)\n'
            '- accent_colors (list of hex codes)\n'
            '- typography (list of font family names)\n'
            '- tone_of_voice (e.g., Professional, Minimalist, Playful)\n'
            '- visual_style (e.g., Glassmorphism, Flat Design, Brutalist)\n'
            '\nReturn ONLY valid JSON, no markdown.'
        )
        try:
            response = self.model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            return {"error": "Could not parse BIV from AI response", "raw": text}
        except Exception as e:
            return {"error": str(e)}

def get_style_agent():
    key = os.getenv("GEMINI_KEY_1")
    return StyleAgent(key)
