import os
import time
import subprocess
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class Model3DEngine:
    def __init__(self):
        self.output_dir = "outputs/3d_models"
        os.makedirs(self.output_dir, exist_ok=True)
        key = os.getenv("GEMINI_KEY_1")
        if key:
            genai.configure(api_key=key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def generate_model(self, prompt: str, method: str = "shape"):
        """
        Generate 3D model using ShapE (local diffusion) or fallback to demo.
        Methods: 'shape' (local GPU), 'demo' (bundled sample), 'cloud' (Colab link)
        """
        filename = f"{prompt.replace(' ', '_')[:30]}_{int(time.time())}.glb"
        filepath = os.path.join(self.output_dir, filename)

        if method == "shape":
            return self._generate_with_shap_e(prompt, filepath)
        elif method == "cloud":
            return self._get_cloud_link(prompt)
        else:
            return self._generate_demo(prompt, filepath)

    def _generate_with_shap_e(self, prompt: str, filepath: str):
        """Attempt local ShapE generation. Falls back to demo if unavailable."""
        try:
            import torch
            from diffusers import ShapEPipeline, ShapEImg2ImgPipeline
            from diffusers.utils import export_to_ply

            device = "cuda" if torch.cuda.is_available() else "cpu"
            pipe = ShapEPipeline.from_pretrained("openai/shap-e", torch_dtype=torch.float16 if device == "cuda" else torch.float32)
            pipe = pipe.to(device)

            images = pipe(prompt, guidance_scale=15.0, num_inference_steps=64, frame_size=256).images
            
            ply_path = filepath.replace('.glb', '.ply')
            export_to_ply(images[0], ply_path)
            
            # Convert PLY to GLB using trimesh
            import trimesh
            mesh = trimesh.load(ply_path)
            mesh.export(filepath)
            os.remove(ply_path)

            return {
                "status": "success",
                "method": "shap_e_local",
                "device": device,
                "file_path": filepath,
                "filename": os.path.basename(filepath)
            }
        except ImportError:
            print("[3D] ShapE/diffusers not available. Falling back to demo mode.")
            return self._generate_demo(prompt, filepath)
        except Exception as e:
            print(f"[3D] Local generation failed: {e}. Falling back to demo.")
            return self._generate_demo(prompt, filepath)

    def _generate_demo(self, prompt: str, filepath: str):
        """Generate a minimal valid GLB file for demo/preview purposes."""
        # Minimal glTF JSON for a colored cube
        import struct
        gltf = {
            "asset": {"version": "2.0", "generator": "AXIOM Studio"},
            "scene": 0,
            "scenes": [{"nodes": [0]}],
            "nodes": [{"mesh": 0, "name": prompt[:30]}],
            "meshes": [{"primitives": [{"attributes": {"POSITION": 0}, "indices": 1}]}],
            "accessors": [
                {"bufferView": 0, "componentType": 5126, "count": 8, "type": "VEC3", "max": [1,1,1], "min": [-1,-1,-1]},
                {"bufferView": 1, "componentType": 5123, "count": 36, "type": "SCALAR"}
            ],
            "bufferViews": [
                {"buffer": 0, "byteOffset": 0, "byteLength": 96},
                {"buffer": 0, "byteOffset": 96, "byteLength": 72}
            ],
            "buffers": [{"byteLength": 168}]
        }
        
        # 8 vertices of a unit cube
        vertices = [
            -1,-1,-1, 1,-1,-1, 1,1,-1, -1,1,-1,
            -1,-1,1, 1,-1,1, 1,1,1, -1,1,1
        ]
        # 12 triangles (36 indices)
        indices = [
            0,1,2, 0,2,3, 4,6,5, 4,7,6,
            0,4,5, 0,5,1, 2,6,7, 2,7,3,
            0,3,7, 0,7,4, 1,5,6, 1,6,2
        ]
        
        bin_data = b''
        for v in vertices:
            bin_data += struct.pack('<f', v)
        for i in indices:
            bin_data += struct.pack('<H', i)
        
        gltf_json = json.dumps(gltf).encode('utf-8')
        # Pad JSON to 4-byte boundary
        while len(gltf_json) % 4 != 0:
            gltf_json += b' '
        while len(bin_data) % 4 != 0:
            bin_data += b'\x00'
        
        # GLB header
        total_length = 12 + 8 + len(gltf_json) + 8 + len(bin_data)
        header = struct.pack('<4sII', b'glTF', 2, total_length)
        json_chunk = struct.pack('<I4s', len(gltf_json), b'JSON') + gltf_json
        bin_chunk = struct.pack('<I4s', len(bin_data), b'BIN\x00') + bin_data
        
        with open(filepath, 'wb') as f:
            f.write(header + json_chunk + bin_chunk)
        
        return {
            "status": "success",
            "method": "demo_cube",
            "file_path": filepath,
            "filename": os.path.basename(filepath),
            "note": "Demo cube generated. Install diffusers+torch for AI generation."
        }

    def _get_cloud_link(self, prompt: str):
        """Return a Google Colab link for cloud-based 3D generation."""
        colab_url = f"https://colab.research.google.com/github/openai/shap-e/blob/main/notebooks/sample_text_to_3d.ipynb"
        return {
            "status": "success",
            "method": "cloud_colab",
            "colab_url": colab_url,
            "prompt": prompt,
            "note": "Open this Colab notebook, paste the prompt, and download the .glb file."
        }

    def generate_animation_keyframes(self, prompt: str, duration: float = 5.0):
        """Use Gemini to generate animation keyframes for a 3D model."""
        ai_prompt = f"""
        Generate a smooth 3D animation sequence for: "{prompt}"
        Duration: {duration} seconds at 30fps.
        
        Return ONLY a JSON array of keyframe objects. NO markdown.
        Each keyframe must have:
        - "time": float (seconds)
        - "position": [x, y, z]
        - "rotation": [rx, ry, rz] (degrees)
        - "scale": [sx, sy, sz]
        
        Include at least 5 keyframes for smooth interpolation.
        Make it cinematic (e.g. Apple product reveal style).
        
        Example: [{{"time": 0, "position": [0,0,0], "rotation": [0,0,0], "scale": [1,1,1]}}]
        """
        try:
            response = self.model.generate_content(ai_prompt)
            import re
            text = response.text.replace('```json', '').replace('```', '').strip()
            match = re.search(r'\[.*\]', text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            return []
        except Exception as e:
            print(f"[3D ANIM] Keyframe generation failed: {e}")
            # Fallback: basic spin animation
            return [
                {"time": 0.0, "position": [0, -2, 0], "rotation": [0, 0, 0], "scale": [0.1, 0.1, 0.1]},
                {"time": 1.0, "position": [0, 0, 0], "rotation": [0, 90, 0], "scale": [1, 1, 1]},
                {"time": 2.5, "position": [0, 0, 0], "rotation": [0, 180, 0], "scale": [1, 1, 1]},
                {"time": 4.0, "position": [0, 0, 0], "rotation": [0, 270, 0], "scale": [1, 1, 1]},
                {"time": 5.0, "position": [0, 0.5, 0], "rotation": [0, 360, 0], "scale": [1.1, 1.1, 1.1]}
            ]

    def launch_blender(self, glb_path: str = None):
        """Attempt to launch Blender with the given GLB file."""
        blender_paths = [
            r"C:\Program Files\Blender Foundation\Blender 4.2\blender.exe",
            r"C:\Program Files\Blender Foundation\Blender 4.1\blender.exe",
            r"C:\Program Files\Blender Foundation\Blender 4.0\blender.exe",
            r"C:\Program Files\Blender Foundation\Blender 3.6\blender.exe",
        ]
        
        blender_exe = None
        for path in blender_paths:
            if os.path.exists(path):
                blender_exe = path
                break
        
        if not blender_exe:
            return {"status": "error", "message": "Blender not found. Please install Blender from blender.org"}
        
        try:
            cmd = [blender_exe]
            if glb_path and os.path.exists(glb_path):
                # Create import script
                script = f"""
import bpy
bpy.ops.import_scene.gltf(filepath=r'{glb_path}')
"""
                script_path = os.path.join(self.output_dir, "_import_script.py")
                with open(script_path, "w") as f:
                    f.write(script)
                cmd += ["--python", script_path]
            
            subprocess.Popen(cmd)
            return {"status": "success", "message": f"Blender launched with {blender_exe}"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
