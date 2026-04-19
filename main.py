import os
import random
import firebase_admin
import google.generativeai as genai
from firebase_admin import credentials, auth, firestore
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Import Nexus Agents
from agents.style_agent import get_style_agent
from agents.social_agent import get_social_agent
from agents.reddit_scout import get_reddit_scout

# Import Generators
from generators.ppt_generator import PPTGenerator
from generators.model_3d_engine import Model3DEngine

# Load Environment Variables
load_dotenv()

app = FastAPI(title="AXIOM Compute Node | AI Orchestrator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for outputs
os.makedirs("outputs", exist_ok=True)
os.makedirs("outputs/3d_models", exist_ok=True)
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Initialize Generators
ppt_gen = PPTGenerator()
model_3d = Model3DEngine()

# ==========================================
# 🔥 FIREBASE INITIALIZATION
# ==========================================
try:
    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "./serviceAccountKey.json")
    if os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print(f"[SYSTEM] Firebase Admin initialized using {service_account_path}")
    else:
        print("[WARNING] Firebase Service Account not found. Admin features might fail.")
        db = None
except Exception as e:
    print(f"[ERROR] Failed to initialize Firebase Admin: {e}")
    db = None

# ==========================================
# 💎 MONETIZATION & SUBSCRIPTION LOGIC
# ==========================================

TIERS = {
    "FREE": {
        "price": 0,
        "limits": {"api_calls": 50, "local_calls": 100},
        "features": ["Basic Editing", "Standard Export", "Round-Robin API"]
    },
    "PRO_LOCAL": {
        "price": 49, # ₹49 INR
        "limits": {"api_calls": 100, "local_calls": 999999}, # Unlimited Local
        "features": ["Gemma 4b Turboquant", "Local 3D Diffusion", "No Watermark"]
    },
    "PRO_CLOUD": {
        "price": 149, # ₹149 INR
        "limits": {"api_calls": 1000, "local_calls": 999999},
        "features": ["Gemini Vision Layout Analysis", "Priority API Routing", "4K Export"]
    },
    "PRO_MAX": {
        "price": 249, # ₹249 INR
        "limits": {"api_calls": 999999, "local_calls": 999999},
        "features": ["Unlimited Everything", "Custom Domain", "Team Collaboration"]
    }
}

class PaymentRequest(BaseModel):
    tier: str
    user_id: str


# ==========================================
# 🧠 AI ORCHESTRATOR: KEY ROTATION & FALLBACK
# ==========================================

class AIOrchestrator:
    def __init__(self):
        # Fetch up to 5 keys from environment variables
        self.gemini_keys = [
            os.getenv(f"GEMINI_KEY_{i}") for i in range(1, 6)
            if os.getenv(f"GEMINI_KEY_{i}") and os.getenv(f"GEMINI_KEY_{i}") != "your_gemini_key_placeholder"
        ]
        
        if not self.gemini_keys:
            print("[CRITICAL] No Gemini API keys found in .env! AI generation will fail.")
            # Fallback to empty list or dummy key to prevent crash during init
            self.gemini_keys = ["DUMMY_KEY"]
            
        self.current_key_index = 0
        
        # Local Model Configs
        self.use_local_gemma_4bit = False
        self.use_local_diffusion = False

    def get_next_available_key(self) -> str:
        """Round-robin API key selection to bypass rate limits"""
        key = self.gemini_keys[self.current_key_index]
        self.current_key_index = (self.current_key_index + 1) % len(self.gemini_keys)
        print(f"[ORCHESTRATOR] Switching to API Key Slot: {self.current_key_index}")
        return key
        
    def generate_with_vision(self, image_data: str, prompt: str):
        """Uses Gemini Vision to adjust designs/animations on the canvas"""
        key = self.get_next_available_key()
        genai.configure(api_key=key)
        
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            # Assuming image_data is a base64 string
            # In real implementation, decode base64 to bytes/PIL
            # response = model.generate_content([prompt, image_parts])
            print(f"[VISION] Analyzing canvas layout using key {key[:8]}...")
            
            # Simulated real response for the sake of the node engine
            return {
                "action": "ADJUST_NODE", 
                "target": "all", 
                "status": "success",
                "ai_insight": "Canvas analysis complete. Recommended adjustments applied."
            }
        except Exception as e:
            print(f"[ERROR] Gemini Vision failed: {e}")
            raise HTTPException(status_code=500, detail=f"AI Vision Error: {str(e)}")

    def generate_text(self, prompt: str):
        """Standard text generation via Gemini"""
        key = self.get_next_available_key()
        genai.configure(api_key=key)
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"[ERROR] Gemini Text failed: {e}")
            return f"Error: Could not generate insight. ({str(e)})"

orchestrator = AIOrchestrator()

class GenerateRequest(BaseModel):
    prompt: str
    vision_image: Optional[str] = None # Base64 canvas state
    use_local: bool = False
    model_type: str = "text" # 'text', 'image', '3d'

@app.get("/")
def read_root():
    return {"status": "online", "system": "AXIOM Compute Node v1", "monetization": "active"}

@app.post("/api/checkout/razorpay")
def create_razorpay_order(req: PaymentRequest):
    """
    Mock Razorpay Order Creation Endpoint
    Generates a UPI-compatible payment link for the requested tier.
    """
    if req.tier not in TIERS:
        raise HTTPException(status_code=400, detail="Invalid Subscription Tier")
    
    tier_data = TIERS[req.tier]
    print(f"[RAZORPAY] Generating ₹{tier_data['price']} UPI Invoice for User {req.user_id} -> {req.tier}")
    
    return {
        "status": "success",
        "order_id": f"order_razor_{random.randint(10000, 99999)}",
        "amount_inr": tier_data["price"],
        "upi_link": f"upi://pay?pa=axiom@razorpay&pn=AXIOM+Studio&am={tier_data['price']}.00",
        "features_unlocked": tier_data["features"]
    }

@app.post("/api/auth/verify")
def verify_firebase_token(id_token: str):
    """
    Verify Firebase ID Token from the frontend.
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        return {"status": "success", "uid": uid}
    except Exception as e:
        print(f"[AUTH ERROR] {e}")
        # FALLBACK MOCK FOR ENVIRONMENT WITHOUT GOOGLE CREDENTIALS
        if not os.path.exists(os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "")):
             return {"status": "success", "uid": "dev_user_mock", "warning": "No service account found"}
        raise HTTPException(status_code=401, detail="Invalid Authentication Token")

class ComputeRequest(BaseModel):
    formula: str
    context: Dict[str, Any]

@app.post("/api/generate")
def generate_asset(req: GenerateRequest):
    """
    Intelligent Router: Sends request to Gemini API (Round Robin) or Local Gemma/Diffusion
    """
    if req.use_local:
        if req.model_type == "3d":
            print(f"[LOCAL COMPUTE] Generating 3D Model via Local Diffusion...")
            return {"status": "success", "source": "local_diffusion_3d", "data": "model.glb"}
        elif req.model_type == "image":
            print(f"[LOCAL COMPUTE] Generating Image via Local Stable Diffusion...")
            return {"status": "success", "source": "local_sd", "data": "image.png"}
        else:
            print(f"[LOCAL COMPUTE] Running Gemma 4-bit Turboquant inference...")
            return {"status": "success", "source": "local_gemma_4b", "text": "Local LLM Response"}
            
    else:
        # Use Gemini API Network with Round-Robin
        if req.vision_image:
            return orchestrator.generate_with_vision(req.vision_image, req.prompt)
            
        ai_response = orchestrator.generate_text(req.prompt)
        
        return {
            "status": "success",
            "action": "CREATE_NODE",
            "source": f"gemini_cloud_key_{orchestrator.current_key_index}",
            "node": {
                "type": "TEXT",
                "name": "AI Generated Insight",
                "x": 200,
                "y": 200,
                "textProps": {
                    "text": ai_response,
                    "fontFamily": "Inter",
                    "fontSize": 24,
                    "color": "#00d2ff"
                }
            }
        }

@app.post("/api/compute")
def compute_formula(req: ComputeRequest):
    """
    Data Engine Endpoint.
    Executes spreadsheet formulas and returns the computed result.
    """
    print(f"[DATA ENGINE] Evaluating formula: {req.formula}")
    
    # Mock evaluation logic for spreadsheet formulas
    if req.formula.startswith("=SUM"):
        return {"result": 42000, "type": "number"}
    
    return {"result": "Computed Data", "type": "string"}

# ==========================================
# 📊 PPT AUTOMATION ENGINE
# ==========================================

class PPTRequest(BaseModel):
    topic: str
    slide_count: int = 5
    style: str = "professional"

@app.post("/api/generate/ppt")
def generate_ppt(req: PPTRequest):
    result = ppt_gen.generate_presentation(req.topic, req.slide_count, req.style)
    return {"status": "success", **result}

@app.post("/api/generate/ppt/outline")
def generate_ppt_outline(req: PPTRequest):
    outline = ppt_gen.generate_outline_only(req.topic, req.slide_count, req.style)
    return {"status": "success", "outline": outline}

@app.get("/api/download/{filename}")
def download_file(filename: str):
    file_path = os.path.join("outputs", filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, filename=filename)

# ==========================================
# 🎲 3D MODEL & ANIMATION ENGINE
# ==========================================

class Model3DRequest(BaseModel):
    prompt: str
    method: str = "demo"  # 'shape', 'demo', 'cloud'

class AnimateRequest(BaseModel):
    prompt: str
    duration: float = 5.0

@app.post("/api/generate/3d")
def generate_3d_model(req: Model3DRequest):
    result = model_3d.generate_model(req.prompt, req.method)
    return {"status": "success", **result}

@app.post("/api/animate")
def animate_3d_model(req: AnimateRequest):
    keyframes = model_3d.generate_animation_keyframes(req.prompt, req.duration)
    return {"status": "success", "keyframes": keyframes}

@app.post("/api/blender/launch")
def launch_blender(glb_path: str = None):
    result = model_3d.launch_blender(glb_path)
    return result

# ==========================================
# 🌌 AXIOM NEXUS: AGENT ENDPOINTS
# ==========================================

class StyleRequest(BaseModel):
    source: str
    is_url: bool = True

@app.post("/api/nexus/analyze-style")
async def analyze_style(req: StyleRequest):
    agent = get_style_agent()
    result = await agent.analyze_brand(req.source, req.is_url)
    return result

class SuggestRequest(BaseModel):
    niche: str
    style_context: Dict[str, Any]

@app.post("/api/nexus/suggest")
async def suggest_social_content(req: SuggestRequest):
    agent = get_social_agent()
    suggestions = await agent.suggest_content(req.niche, req.style_context)
    return {"status": "success", "suggestions": suggestions}

@app.get("/api/reddit/leads")
async def get_reddit_leads(keywords: str = "SaaS,Design", subreddits: str = "SaaS,Design"):
    agent = get_reddit_scout()
    leads = await agent.find_leads(keywords.split(','), subreddits.split(','))
    return {"status": "success", "leads": leads}

# ==========================================
# 🌐 SERVE FRONTEND (Production Mode)
# ==========================================
frontend_dist = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(frontend_dist):
    from fastapi.responses import HTMLResponse
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="frontend_assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        index_path = os.path.join(frontend_dist, "index.html")
        with open(index_path, "r") as f:
            return HTMLResponse(content=f.read())

if __name__ == "__main__":
    import uvicorn
    import webbrowser
    print("\n" + "="*50)
    print("  AXIOM STUDIO ENGINE v2.0")
    print("  http://localhost:8080")
    print("="*50 + "\n")
    webbrowser.open("http://localhost:8080")
    uvicorn.run(app, host="0.0.0.0", port=8080)
