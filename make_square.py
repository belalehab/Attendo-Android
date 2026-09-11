from PIL import Image

def make_square(img_path):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    
    if width == height:
        return
        
    size = max(width, height)
    new_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    new_img.paste(img, ((size - width) // 2, (size - height) // 2))
    new_img.save(img_path)

make_square('public/attendo-icon.png')
