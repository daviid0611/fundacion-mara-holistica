# -*- coding: utf-8 -*-
"""
Optimiza y renombra las fotos de la galeria.

Uso:
  1. Pon las fotos originales (cualquier nombre/tamano) en:
       fotos/originales/comunidad/
       fotos/originales/artesanias/
  2. Ejecuta:  python optimizar-fotos.py
  3. Genera versiones ligeras y renombradas en:
       fotos/comunidad/comunidad-1.jpg, comunidad-2.jpg, ...
       fotos/artesanias/artesania-1.jpg, artesania-2.jpg, ...

Requiere Pillow:  python -m pip install Pillow
"""

import os
import re
from PIL import Image, ImageOps

# Carpeta de originales -> (carpeta destino, prefijo de archivo)
CATEGORIAS = {
    "comunidad": ("comunidad", "comunidad"),
    "artesanias": ("artesanias", "artesania"),
}

LADO_MAX = 1600          # px del lado mas largo
CALIDAD = 82             # calidad JPEG (0-100)
EXTENSIONES = (".jpg", ".jpeg", ".png", ".webp", ".heic", ".bmp", ".tif", ".tiff")

BASE = os.path.dirname(os.path.abspath(__file__))


def orden_natural(nombre):
    """Ordena 'foto2' antes que 'foto10'."""
    return [int(t) if t.isdigit() else t.lower()
            for t in re.split(r"(\d+)", nombre)]


def optimizar_categoria(carpeta_origen, carpeta_destino, prefijo):
    src = os.path.join(BASE, "fotos", "originales", carpeta_origen)
    dst = os.path.join(BASE, "fotos", carpeta_destino)
    os.makedirs(dst, exist_ok=True)

    if not os.path.isdir(src):
        print(f"  (sin carpeta {src}, omitida)")
        return 0

    # Borra salidas previas generadas (para re-ejecutar limpio)
    for f in os.listdir(dst):
        if re.fullmatch(rf"{prefijo}-\d+\.jpg", f):
            os.remove(os.path.join(dst, f))

    archivos = [f for f in os.listdir(src)
                if f.lower().endswith(EXTENSIONES)]
    archivos.sort(key=orden_natural)

    n = 0
    for f in archivos:
        ruta = os.path.join(src, f)
        try:
            img = Image.open(ruta)
        except Exception as e:
            print(f"  ! No se pudo abrir {f}: {e}")
            continue

        img = ImageOps.exif_transpose(img)        # respeta rotacion del celular
        img = img.convert("RGB")                  # quita alfa/EXIF, asegura JPEG
        img.thumbnail((LADO_MAX, LADO_MAX))       # reduce solo si es mas grande

        n += 1
        salida = os.path.join(dst, f"{prefijo}-{n}.jpg")
        img.save(salida, "JPEG", quality=CALIDAD, optimize=True, progressive=True)
        kb = os.path.getsize(salida) // 1024
        print(f"  {f}  ->  {prefijo}-{n}.jpg  ({kb} KB)")

    return n


def main():
    print("Optimizando fotos...\n")
    total = 0
    for origen, (destino, prefijo) in CATEGORIAS.items():
        print(f"[{origen}]")
        total += optimizar_categoria(origen, destino, prefijo)
        print()
    print(f"Listo. {total} fotos optimizadas.")


if __name__ == "__main__":
    main()
