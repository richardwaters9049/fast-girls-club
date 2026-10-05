"""Strip embedded maps replaced by Model.tsx; preserve compressed geometry and livery."""
import json
import struct
from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'public/images/3Dimages'
source = (root / 'formula-1-meshopt.glb').read_bytes()
json_size = struct.unpack_from('<I', source, 12)[0]
document = json.loads(source[20:20 + json_size])
binary_start = 20 + json_size + 8
binary = source[binary_start:]
removed_views = {image['bufferView'] for image in document['images']}
ranges = sorted((document['bufferViews'][index]['byteOffset'], document['bufferViews'][index]['byteLength']) for index in removed_views)

def offset(value):
    return value - sum(length for start, length in ranges if start + length <= value)

parts = []
end = 0
for start, length in ranges:
    parts.append(binary[end:start])
    end = start + length
parts.append(binary[end:])
binary = b''.join(parts)
views = []
indices = {}
for index, view in enumerate(document['bufferViews']):
    if index in removed_views:
        continue
    indices[index] = len(views)
    if view.get('buffer') == 0:
        view['byteOffset'] = offset(view.get('byteOffset', 0))
    compressed = view.get('extensions', {}).get('EXT_meshopt_compression')
    if compressed and compressed['buffer'] == 0:
        compressed['byteOffset'] = offset(compressed.get('byteOffset', 0))
    views.append(view)
document['bufferViews'] = views

def remap(value):
    if isinstance(value, dict):
        for key, item in value.items():
            if key == 'bufferView':
                value[key] = indices[item]
            else:
                remap(item)
    elif isinstance(value, list):
        for item in value:
            remap(item)

# These maps are always replaced by the branded livery and material settings.
for material in document['materials']:
    pbr = material.get('pbrMetallicRoughness', {})
    if 'baseColorTexture' in pbr or 'metallicRoughnessTexture' in pbr:
        assert material['name'] == 'Mat'
        pbr.pop('baseColorTexture', None)
        pbr.pop('metallicRoughnessTexture', None)
for key in ['images', 'textures', 'samplers']:
    document.pop(key, None)
remap(document)
document['buffers'][0]['byteLength'] = len(binary)
json_bytes = json.dumps(document, separators=(',', ':')).encode()
json_bytes += b' ' * (-len(json_bytes) % 4)
binary += b'\0' * (-len(binary) % 4)
output = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(json_bytes) + 8 + len(binary))
output += struct.pack('<II', len(json_bytes), 0x4E4F534A) + json_bytes
output += struct.pack('<II', len(binary), 0x004E4942) + binary
(root / 'formula-1-brand-meshopt.glb').write_bytes(output)
print(f'Model: {len(source):,} → {len(output):,} bytes')
