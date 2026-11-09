from PIL import Image
import os

source_path = r"C:/Users/GAMESCASH-PC/.gemini/antigravity/brain/3091dc96-bb40-4aae-9c0f-ccbc69d6a553/.user_uploaded/media_1794253664130_8e29700c.jpg"
output_dir = r"d:/Recharge dz/recharge-app/public/images/diamonds"
os.makedirs(output_dir, exist_ok=True)

img = Image.open(source_path).convert("RGB")
w, h = img.size

# Let's define the bounding boxes for our key tiers:
# (name, (x1, y1, x2, y2)) with small padding
boxes = {
    "diamond-1": (45, 35, 155, 152),       # Single diamond (e.g. 50-86)
    "diamond-2": (215, 35, 375, 152),      # 2 diamonds (e.g. 172)
    "diamond-3": (410, 35, 590, 152),      # 3 diamonds (e.g. 257)
    "diamond-4": (610, 35, 795, 152),      # 4 diamonds (e.g. 344)
    "diamond-5": (818, 35, 1005, 152),     # 5 diamonds
    "diamond-pile-1": (12, 185, 198, 318),  # Pile 1 (e.g. 514)
    "diamond-pile-2": (615, 185, 805, 318), # Medium pile (e.g. 706)
    "diamond-pouch": (210, 335, 400, 485),  # Velvet pouch (e.g. 1060)
    "diamond-chest-1": (605, 335, 795, 485),# Chest (e.g. 2195)
    "diamond-chest-2": (505, 495, 860, 670),# Mega chest (e.g. 3688+)
}

def remove_black_background(cropped_img):
    cropped = cropped_img.convert("RGBA")
    data = cropped.getdata()
    new_data = []
    
    for r, g, b, a in data:
        # Maximum channel brightness
        v = max(r, g, b)
        
        # If very close to black
        if v < 15:
            new_data.append((0, 0, 0, 0))
        elif v < 40:
            # Soft transition for subtle glow
            ratio = (v - 15) / 25.0
            alpha = int(ratio * ratio * 180)
            if alpha > 0:
                nr = min(255, int(r * 255.0 / max(1, alpha)))
                ng = min(255, int(g * 255.0 / max(1, alpha)))
                nb = min(255, int(b * 255.0 / max(1, alpha)))
                new_data.append((nr, ng, nb, alpha))
            else:
                new_data.append((0, 0, 0, 0))
        else:
            # Fully visible diamond core and primary glow
            alpha = min(255, int(255 * ((v / 255.0) ** 0.65)))
            alpha = max(alpha, int(v * 1.1))
            alpha = min(255, max(0, alpha))
            
            nr = min(255, int(r * 255.0 / max(v, 1)))
            ng = min(255, int(g * 255.0 / max(v, 1)))
            nb = min(255, int(b * 255.0 / max(v, 1)))
            new_data.append((nr, ng, nb, alpha))
            
    cropped.putdata(new_data)
    
    # Trim empty transparent edges with 8px margin
    bbox = cropped.getbbox()
    if bbox:
        pad = 6
        x1 = max(0, bbox[0] - pad)
        y1 = max(0, bbox[1] - pad)
        x2 = min(cropped.width, bbox[2] + pad)
        y2 = min(cropped.height, bbox[3] + pad)
        cropped = cropped.crop((x1, y1, x2, y2))
        
    return cropped

for name, box in boxes.items():
    cropped = img.crop(box)
    transparent = remove_black_background(cropped)
    # Resize to nice sharp web standard if needed, or keep high-res
    out_file = os.path.join(output_dir, f"{name}.png")
    transparent.save(out_file, "PNG")
    print(f"Saved {name}.png: size={transparent.size}")

print("All diamond tier icons processed successfully!")

