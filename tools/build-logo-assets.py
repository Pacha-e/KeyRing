"""Generate brand assets from logo-original.jpeg.

The original has a flat cream background. Instead of cutting it out with a hard
threshold (which leaves jagged edges), the alpha is computed from the distance to
the background color and the color is decontaminated: this keeps anti-aliased
edges clean even over the dark sidebar.

Output goes to frontend/public/:
  logo-keyring.png      full logo with transparency
  isotipo-keyring.png   icon only, square (sidebar)
  favicon-32.png        browser tab
  apple-touch-icon.png  mobile shortcut
"""

from pathlib import Path
from PIL import Image
import numpy as np

BASE = Path(__file__).parent
ORIGINAL = BASE.parent / "docs" / "assets" / "logo-original.jpeg"
DESTINATION = BASE.parent / "frontend" / "public"

# Distance threshold to the background: below is pure background, above is ink.
# The intermediate range produces the soft alpha at the edges.
THRESHOLD = 70.0

# The original is a JPEG, so the "flat" background carries compression noise.
# Anything below this distance is treated as pure background; without this dead
# zone the noise counts as content and the crop spans the whole image.
DEAD_ZONE = 22.0


def remove_background(image: Image.Image) -> Image.Image:
    """Replace the flat background with transparency, keeping soft edges."""
    pixels = np.asarray(image.convert("RGB")).astype(np.float32)
    background = np.array(image.convert("RGB").getpixel((2, 2)), dtype=np.float32)

    distance = np.linalg.norm(pixels - background, axis=2)
    alpha = np.clip((distance - DEAD_ZONE) / (THRESHOLD - DEAD_ZONE), 0.0, 1.0)

    # Decontamination: recover the real color by removing the background portion
    # that each semi-transparent pixel contributes. Without this, edges carry cream.
    alpha_3d = alpha[..., None]
    safe_alpha = np.maximum(alpha_3d, 1e-4)
    color = np.clip((pixels - (1.0 - alpha_3d) * background) / safe_alpha, 0, 255)

    output = np.dstack([color, alpha * 255.0]).astype(np.uint8)
    return Image.fromarray(output, mode="RGBA")


def bounding_box(image: Image.Image, min_alpha: int = 8) -> tuple[int, int, int, int]:
    """Box that encloses every non-transparent pixel."""
    alpha = np.asarray(image)[..., 3]
    rows = np.where(alpha.max(axis=1) > min_alpha)[0]
    columns = np.where(alpha.max(axis=0) > min_alpha)[0]
    return int(columns[0]), int(rows[0]), int(columns[-1]) + 1, int(rows[-1]) + 1


def extract_isotype(image: Image.Image, min_alpha: int = 8) -> Image.Image:
    """Isolate the icon by looking for the widest vertical gap between icon and text."""
    alpha = np.asarray(image)[..., 3]
    ink_column = alpha.max(axis=0) > min_alpha
    left, top, right, bottom = bounding_box(image, min_alpha)

    best_start, best_width, start = None, 0, None
    for x in range(left, right):
        if not ink_column[x]:
            start = x if start is None else start
        elif start is not None:
            if x - start > best_width:
                best_start, best_width = start, x - start
            start = None

    cut = best_start if best_start is not None else right
    return image.crop((left, top, cut, bottom))


def lighten_dark_ink(image: Image.Image) -> Image.Image:
    """Change charcoal ink to cream, leaving terracotta untouched.

    The original logo combines terracotta and charcoal. Over the very dark blue
    sidebar the charcoal disappears. This variant keeps contrast without manually
    retouching the logo.
    """
    CHARCOAL = np.array([46, 46, 46], dtype=np.float32)
    CREAM = np.array([243, 239, 230], dtype=np.float32)

    data = np.asarray(image).astype(np.float32)
    color, alpha = data[..., :3], data[..., 3:]

    # The closer a pixel is to charcoal, the more cream is applied.
    closeness = np.clip(1.0 - np.linalg.norm(color - CHARCOAL, axis=2)[..., None] / 120.0, 0.0, 1.0)
    recolored = color * (1 - closeness) + CREAM * closeness

    return Image.fromarray(np.dstack([recolored, alpha]).astype(np.uint8), mode="RGBA")


def center_square(image: Image.Image, margin: float = 0.06) -> Image.Image:
    """Center the image on a transparent square canvas."""
    width, height = image.size
    side = int(max(width, height) * (1 + margin * 2))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(image, ((side - width) // 2, (side - height) // 2), image)
    return canvas


def main() -> None:
    DESTINATION.mkdir(parents=True, exist_ok=True)
    original = Image.open(ORIGINAL)
    without_background = remove_background(original)

    complete = without_background.crop(bounding_box(without_background))
    complete.save(DESTINATION / "logo-keyring.png")
    print(f"logo-keyring.png      {complete.size[0]}x{complete.size[1]}")

    isotype = center_square(extract_isotype(without_background))
    isotype.save(DESTINATION / "isotipo-keyring.png")
    print(f"isotipo-keyring.png   {isotype.size[0]}x{isotype.size[1]}")

    # Variant for the sidebar, which has a very dark blue background.
    light_isotype = lighten_dark_ink(isotype)
    light_isotype.save(DESTINATION / "isotipo-keyring-claro.png")
    print(f"isotipo-keyring-claro.png {light_isotype.size[0]}x{light_isotype.size[1]}")

    for name, size in (("favicon-32.png", 32), ("apple-touch-icon.png", 180)):
        isotype.resize((size, size), Image.LANCZOS).save(DESTINATION / name)
        print(f"{name:<21} {size}x{size}")


if __name__ == "__main__":
    main()
