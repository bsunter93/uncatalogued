# Prepare a gear model for runtime attachment. Output is in "grip space": the hero stands 1 unit tall facing -Y (Blender),
# and the origin is where the hand, head centre or chest centre goes. Usage: blender -b --python tools/gear.py -- in.glb out.glb kind size [flip]
import bpy, sys, math
from mathutils import Vector, Matrix
a = sys.argv[sys.argv.index('--') + 1:]; src, out, kind, size = a[0], a[1], a[2], float(a[3]); flip = 'flip' in a[4:]; turn = 'turn' in a[4:]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=src)
ms = [o for o in bpy.context.scene.objects if o.type == 'MESH']
for o in ms: o.select_set(True)
bpy.context.view_layer.objects.active = ms[0]
if len(ms) > 1: bpy.ops.object.join()
o = bpy.context.view_layer.objects.active; bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM'); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for e in [e for e in bpy.context.scene.objects if e != o]: bpy.data.objects.remove(e)
vs = [v.co.copy() for v in o.data.vertices]; lo = Vector([min(v[i] for v in vs) for i in range(3)]); hi = Vector([max(v[i] for v in vs) for i in range(3)]); d = hi - lo; c = (lo + hi) / 2
vs = [v - c for v in vs]; L, M, T = sorted(range(3), key=lambda i: -d[i]); e = [Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))]
basis = lambda x, y, z: Matrix((x, y, z)).transposed()
spread = lambda P: (sum(abs(v[M]) + abs(v[T]) for v in P) / len(P)) if P else 0
wide = 1 if spread([v for v in vs if v[L] > d[L] * .25]) >= spread([v for v in vs if v[L] < -d[L] * .25]) else -1  # which end is the business end
if flip: wide = -wide
if 'up' in a[4:]: wide = 1
if 'down' in a[4:]: wide = -1
if 'swap' in a[4:]: M, T = T, M
if kind in ('blade', 'pole', 'gun', 'sling'):
    n = size / d[L]
    if kind == 'blade': dirv = Vector((0, -math.cos(math.radians(40)), math.sin(math.radians(40)))); grip = .16
    elif kind == 'pole': dirv = Vector((0, 0, 1)); grip = .45
    elif kind == 'gun': dirv = Vector((0, -math.cos(math.radians(-12)), math.sin(math.radians(-12)))); grip = .3
    else: dirv = Vector((0, 0, -1)); grip = .04
    side = Vector((1, 0, 0)); third = dirv.cross(side); src = basis(e[T], e[M] * (-1 if turn else 1), e[L] * wide)
    if src.determinant() < 0: src = basis(-e[T], e[M] * (-1 if turn else 1), e[L] * wide)  # keep it a rotation, never a mirror
    R = basis(side, third, dirv) @ src.inverted()
    off = dirv * (d[L] * n * (.5 - grip))
    for v, p in zip(o.data.vertices, vs): v.co = (R @ p) * n + off
else:  # head and chest pieces arrive upright and facing the camera; just centre and size them by width
    n = size / max(d[0], d[1])
    R = Matrix.Rotation(math.pi, 3, 'Z') if turn else Matrix.Identity(3)
    if 'lay' in a[4:]: R = Matrix.Rotation(-math.pi / 2, 3, 'X'); n = size / max(d[0], d[2])
    for v, p in zip(o.data.vertices, vs): v.co = (R @ p) * n
o.data.update()
for im in bpy.data.images:
    if im.size[0] > 512: im.scale(512, 512)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='JPEG', export_image_quality=86, export_apply=True)
