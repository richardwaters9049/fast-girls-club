# Hero car assets

`formula-1-meshopt.glb` is an optimised version of `formula-1.glb`. Keep the original as the source model; the optimised file is the one loaded by the homepage.

`studio_small_03_1k.hdr` is the Studio Small 03 environment by Greg Zaal, sourced from [Poly Haven](https://polyhaven.com/a/studio_small_03) under CC0. It is served locally so the car does not depend on a third-party asset host at runtime.

`formula1-livery-2k.webp` is an optimised derivative of the existing `formula 1/formula1_BlackPink_Diffuse.png`. Keep the original as the editable source.

The homepage uses `formula-1-brand-meshopt.glb`, generated with `python3 scripts/optimize-hero-car.py`. It preserves meshopt geometry and removes only the embedded Mat textures that Model.tsx replaces with the branded livery/material settings. Keep the original model as the source. Lighting is the512px HDR variant, produced with `magick studio_small_03_1k.hdr -resize 512x256 studio_small_03_512.hdr`. These three runtime assets have a24-hour browser cache; use a new filename when replacing their contents in production.
