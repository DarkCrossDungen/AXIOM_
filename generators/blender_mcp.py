import os
import time
import subprocess
import json
import base64
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class BlenderMCPEngine:
    def __init__(self):
        self.output_dir = "outputs/blender_mcp"
        os.makedirs(self.output_dir, exist_ok=True)
        key = os.getenv("GEMINI_KEY_1")
        if key:
            genai.configure(api_key=key)
        self.model = genai.GenerativeModel('gemini-1.5-pro') # Using Pro for coding

    def execute_autonomous_task(self, prompt: str):
        print(f"[BLENDER MCP] Initiating autonomous task: {prompt}")
        
        script_filename = f"mcp_task_{int(time.time())}.py"
        script_path = os.path.join(self.output_dir, script_filename)
        render_output_prefix = os.path.join(self.output_dir, f"render_{int(time.time())}")
        
        # 1. Ask Gemini to write a comprehensive bpy script
        bpy_script = self._generate_bpy_script(prompt, render_output_prefix)
        if not bpy_script:
            return {"status": "error", "message": "Failed to generate AI script."}
            
        with open(script_path, "w") as f:
            f.write(bpy_script)
            
        # 2. Try executing locally
        result = self._execute_locally(script_path)
        
        if result["status"] == "success":
            return result
            
        # 3. Fallback to Colab if local execution fails
        print("[BLENDER MCP] Local execute failed. Generating Cloud Fallback options.")
        
        colab_html = self._generate_fallback_colab(bpy_script, prompt)
        
        return {
            "status": "fallback",
            "message": "Local render failed (Blender not found or crashed). Fallback options generated.",
            "error_details": result.get("error", "Unknown error"),
            "colab_solution": colab_html,
            "raw_script": bpy_script
        }

    def _generate_bpy_script(self, prompt: str, render_output_prefix: str) -> str:
        # Prompting Gemini to act as a Blender MCP node
        sys_prompt = f"""
        You are a Blender MCP (Model Context Protocol) Node. You execute 3D generation autonomously.
        Write a complete, totally self-contained Python script using `bpy` for Blender 3.0+.
        
        Task: {prompt}
        Output render path prefix (absolute path, do NOT add extension): {os.path.abspath(render_output_prefix).replace(chr(92), '/')}
        
        Requirements:
        1. Delete all default objects (Cube, Light, Camera).
        2. Create the requested 3D geometry/model using python primitives, modifiers, or basic curves.
        3. Create stunning, modern materials (Glossy, Emission, Glass) utilizing Principled BSDF.
        4. Setup a cinematic Camera.
        5. Setup cinematic Lighting (Area lights, multiple colors to contrast).
        6. Animate the object simply if requested (e.g. spinning 360 over 60 frames).
        7. Set render engine to EEVEE or CYCLES. 
        8. Call `bpy.ops.render.render(write_still=True)` or animate to render the final output to the `render_output_prefix` path provided. Add '.mp4' or '.png' config as needed.
        
        Return ONLY valid python code. No markdown formatting, no explanations. Just python code.
        """
        try:
            resp = self.model.generate_content(sys_prompt)
            script = resp.text.strip()
            if script.startswith("```python"):
                script = script[9:]
            if script.startswith("```"):
                script = script[3:]
            if script.endswith("```"):
                script = script[:-3]
            return script.strip()
        except Exception as e:
            print(f"[BLENDER MCP AI ERROR] {e}")
            return ""

    def _execute_locally(self, script_path: str):
        # Look for blender in common paths
        blender_paths = [
            "blender",
            r"C:\Program Files\Blender Foundation\Blender 4.2\blender.exe",
            r"C:\Program Files\Blender Foundation\Blender 4.1\blender.exe",
            r"C:\Program Files\Blender Foundation\Blender 4.0\blender.exe",
            r"C:\Program Files\Blender Foundation\Blender 3.6\blender.exe",
            "/Applications/Blender.app/Contents/MacOS/Blender"
        ]
        
        b_exe = None
        for bp in blender_paths:
            import shutil
            if shutil.which(bp) or os.path.exists(bp):
                b_exe = bp if os.path.exists(bp) else shutil.which(bp)
                break
                
        if not b_exe:
            return {"status": "error", "error": "Blender executable not found on system."}
            
        print(f"[BLENDER MCP] Running script with {b_exe} in background...")
        try:
            # Run headless
            process = subprocess.run(
                [b_exe, "-b", "-P", script_path],
                capture_output=True,
                text=True,
                timeout=300 # 5 min timeout
            )
            
            if process.returncode != 0:
                print(f"[BLENDER MCP ERROR] {process.stderr}")
                return {"status": "error", "error": process.stderr[-500:]} # Last 500 chars of error
                
            return {
                "status": "success",
                "message": "Render completed successfully via MCP.",
                "output_directory": self.output_dir
            }
            
        except subprocess.TimeoutExpired:
            return {"status": "error", "error": "Render timed out after 5 minutes."}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def _generate_fallback_colab(self, script: str, prompt: str) -> str:
        # Returns a base64 encoded HTML content, or we can just return the raw text to be built into an ipynb
        
        escaped_script = script.replace('"""', '\\"\\"\\"')
        
        ipynb = {
          "nbformat": 4,
          "nbformat_minor": 0,
          "metadata": {
            "colab": {
              "name": "AXIOM_Blender_MCP_Cloud",
              "provenance": []
            },
            "kernelspec": {
              "name": "python3",
              "display_name": "Python 3"
            }
          },
          "cells": [
            {
              "cell_type": "markdown",
              "metadata": {"id": "1"},
              "source": [
                f"# 🎲 AXIOM Studio: Blender MCP Cloud Fallback\n",
                f"**Task:** {prompt}\n\n",
                "This notebook installs Blender in the cloud, writes your AI-generated script, and renders it using Google's GPUs."
              ]
            },
            {
              "cell_type": "code",
              "metadata": {"id": "2"},
              "source": [
                "!wget https://download.blender.org/release/Blender3.6/blender-3.6.5-linux-x64.tar.xz\n",
                "!tar xf blender-3.6.5-linux-x64.tar.xz\n",
                "!apt install libXi-dev libxcursor-dev libxrandr-dev libxinerama-dev"
              ],
              "execution_count": None,
              "outputs": []
            },
            {
              "cell_type": "code",
              "metadata": {"id": "3"},
              "source": [
                "script_code = \"\"\"" + escaped_script.replace('outputs/blender_mcp/render', '/content/render') + "\"\"\"\n",
                "with open('mcp_script.py', 'w') as f:\n",
                "  f.write(script_code)\n",
                "\n",
                "!./blender-3.6.5-linux-x64/blender -b -P mcp_script.py\n"
              ],
              "execution_count": None,
              "outputs": []
            }
          ]
        }
        
        # We can construct a data URI for the frontend to download as .ipynb
        json_str = json.dumps(ipynb)
        b64 = base64.b64encode(json_str.encode('utf-8')).decode('utf-8')
        data_uri = f"data:application/x-ipynb+json;base64,{b64}"
        return data_uri
