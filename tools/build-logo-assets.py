"""Genera los recursos de marca a partir de Logo.jpeg.

El fondo del original es un crema plano. En vez de recortarlo con un umbral duro
(que deja bordes dentados), se calcula el alfa a partir de la distancia al color
de fondo y se descontamina el color: así los bordes antialiaseados quedan limpios
también sobre la barra lateral oscura.

Salida en frontend/public/:
  logo-keyring.png      logo completo con transparencia
  isotipo-keyring.png   solo el icono, cuadrado (barra lateral)
  favicon-32.png        pestana del navegador
  apple-touch-icon.png  atajo en movil
"""

from pathlib import Path
from PIL import Image
import numpy as np

BASE = Path(__file__).parent
ORIGINAL = BASE / "Logo.jpeg"
DESTINO = BASE / "frontend" / "public"

# Umbral de distancia al fondo: por debajo es fondo puro, por encima es tinta.
# El tramo intermedio produce el alfa suave de los bordes.
UMBRAL = 70.0

# El original es un JPEG, asi que el fondo "plano" trae ruido de compresion.
# Todo lo que quede por debajo de esta distancia se considera fondo puro; sin
# esta zona muerta el ruido cuenta como contenido y el recorte abarca la imagen
# entera.
ZONA_MUERTA = 22.0


def recortar_fondo(imagen: Image.Image) -> Image.Image:
    """Sustituye el fondo plano por transparencia, conservando los bordes suaves."""
    pixeles = np.asarray(imagen.convert("RGB")).astype(np.float32)
    fondo = np.array(imagen.convert("RGB").getpixel((2, 2)), dtype=np.float32)

    distancia = np.linalg.norm(pixeles - fondo, axis=2)
    alfa = np.clip((distancia - ZONA_MUERTA) / (UMBRAL - ZONA_MUERTA), 0.0, 1.0)

    # Descontaminacion: se despeja el color real quitando la parte de fondo que
    # aporta cada pixel semitransparente. Sin esto los bordes arrastran crema.
    a = alfa[..., None]
    seguro = np.maximum(a, 1e-4)
    color = np.clip((pixeles - (1.0 - a) * fondo) / seguro, 0, 255)

    salida = np.dstack([color, alfa * 255.0]).astype(np.uint8)
    return Image.fromarray(salida, mode="RGBA")


def recuadro_contenido(imagen: Image.Image, minimo_alfa: int = 8) -> tuple[int, int, int, int]:
    """Caja que encierra todo lo que no es transparente."""
    alfa = np.asarray(imagen)[..., 3]
    filas = np.where(alfa.max(axis=1) > minimo_alfa)[0]
    columnas = np.where(alfa.max(axis=0) > minimo_alfa)[0]
    return int(columnas[0]), int(filas[0]), int(columnas[-1]) + 1, int(filas[-1]) + 1


def separar_isotipo(imagen: Image.Image, minimo_alfa: int = 8) -> Image.Image:
    """Aisla el icono buscando el hueco vertical mas ancho entre el y el texto."""
    alfa = np.asarray(imagen)[..., 3]
    columna_con_tinta = alfa.max(axis=0) > minimo_alfa
    izquierda, arriba, derecha, abajo = recuadro_contenido(imagen, minimo_alfa)

    mejor_inicio, mejor_ancho, inicio = None, 0, None
    for x in range(izquierda, derecha):
        if not columna_con_tinta[x]:
            inicio = x if inicio is None else inicio
        elif inicio is not None:
            if x - inicio > mejor_ancho:
                mejor_inicio, mejor_ancho = inicio, x - inicio
            inicio = None

    corte = mejor_inicio if mejor_inicio is not None else derecha
    return imagen.crop((izquierda, arriba, corte, abajo))


def aclarar_tinta_oscura(imagen: Image.Image) -> Image.Image:
    """Cambia la tinta carbon por crema, dejando intacta la terracota.

    El logo original combina terracota y carbon. Sobre la barra lateral, que es
    azul muy oscuro, el carbon desaparece. Esta variante mantiene el contraste
    sin retocar el logo a mano.
    """
    CARBON = np.array([46, 46, 46], dtype=np.float32)
    CREMA = np.array([243, 239, 230], dtype=np.float32)

    datos = np.asarray(imagen).astype(np.float32)
    color, alfa = datos[..., :3], datos[..., 3:]

    # Cuanto mas cerca del carbon esta el pixel, mas se le aplica el crema.
    cercania = np.clip(1.0 - np.linalg.norm(color - CARBON, axis=2)[..., None] / 120.0, 0.0, 1.0)
    recoloreado = color * (1 - cercania) + CREMA * cercania

    return Image.fromarray(np.dstack([recoloreado, alfa]).astype(np.uint8), mode="RGBA")


def a_cuadrado(imagen: Image.Image, margen: float = 0.06) -> Image.Image:
    """Centra la imagen en un lienzo cuadrado transparente."""
    ancho, alto = imagen.size
    lado = int(max(ancho, alto) * (1 + margen * 2))
    lienzo = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    lienzo.paste(imagen, ((lado - ancho) // 2, (lado - alto) // 2), imagen)
    return lienzo


def main() -> None:
    DESTINO.mkdir(parents=True, exist_ok=True)
    original = Image.open(ORIGINAL)
    sin_fondo = recortar_fondo(original)

    completo = sin_fondo.crop(recuadro_contenido(sin_fondo))
    completo.save(DESTINO / "logo-keyring.png")
    print(f"logo-keyring.png      {completo.size[0]}x{completo.size[1]}")

    isotipo = a_cuadrado(separar_isotipo(sin_fondo))
    isotipo.save(DESTINO / "isotipo-keyring.png")
    print(f"isotipo-keyring.png   {isotipo.size[0]}x{isotipo.size[1]}")

    # Variante para la barra lateral, que tiene fondo azul muy oscuro
    isotipo_claro = aclarar_tinta_oscura(isotipo)
    isotipo_claro.save(DESTINO / "isotipo-keyring-claro.png")
    print(f"isotipo-keyring-claro.png {isotipo_claro.size[0]}x{isotipo_claro.size[1]}")

    for nombre, lado in (("favicon-32.png", 32), ("apple-touch-icon.png", 180)):
        isotipo.resize((lado, lado), Image.LANCZOS).save(DESTINO / nombre)
        print(f"{nombre:<21} {lado}x{lado}")


if __name__ == "__main__":
    main()
