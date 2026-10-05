"""Otimiza cópias das imagens; mantém os originais. Requer Pillow (somente manutenção)."""
from pathlib import Path
from PIL import Image, ImageOps
import json

root = Path(__file__).resolve().parents[1]
assets = root / 'public' / 'assets'
output = assets / 'optimized'
output.mkdir(exist_ok=True)
sources = [assets / 'logo-square.png', assets / 'barbershop-fachada.jpg', assets / 'antes.jpeg', assets / 'depois.jpeg', *sorted((assets / 'cortes').glob('*.png'))]
manifest = {}
for source in sources:
    image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    limit = 256 if source.stem == 'logo-square' else 1440
    image.thumbnail((limit, limit), Image.Resampling.LANCZOS)
    target = output / f'{source.stem}.webp'
    image.save(target, 'WEBP', quality=85, method=6)
    manifest[f'/assets/optimized/{target.name}'] = {'width': image.width, 'height': image.height}
    print(f'{source.name}: {source.stat().st_size} -> {target.stat().st_size} bytes ({image.width}x{image.height})')

# A imagem de compartilhamento reutiliza a fachada real, sem criar uma foto fictícia.
image = ImageOps.fit(ImageOps.exif_transpose(Image.open(assets / 'barbershop-fachada.jpg')).convert('RGB'), (1200, 630), method=Image.Resampling.LANCZOS, centering=(0.5, 0.3))
image.save(assets / 'og-barbershop-ws.jpg', quality=90, optimize=True)
icon = Image.open(assets / 'favicon.png').convert('RGBA')
icon.thumbnail((48, 48), Image.Resampling.LANCZOS)
icon.save(output / 'favicon.png', optimize=True)
product_image = Image.open(assets / 'products' / 'gel-fixador.webp')
manifest['/assets/products/gel-fixador.webp'] = {'width': product_image.width, 'height': product_image.height}
(root / 'src' / 'data' / 'imageDimensions.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
