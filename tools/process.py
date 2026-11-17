# Prepare a Meshy GLB for the game: feet on the ground, centred, unit size, 1K texture.
# Usage: blender -b --python tools/process.py -- in.glb out.glb [height|max]
import bpy, sys, mathutils
a = sys.argv[sys.argv.index('--') + 1:]; src, out, mode = a[0], a[1], (a[2] if len(a) > 2 else 'height')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
ms = [o for o in bpy.context.scene.objects if o.type == 'MESH']
for o in ms: o.select_set(True)
bpy.context.view_layer.objects.active = ms[0]
if len(ms) > 1: bpy.ops.object.join()
o = bpy.context.view_layer.objects.active
bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM'); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
vs = [v.co for v in o.data.vertices]
lo = mathutils.Vector([min(v[i] for v in vs) for i in range(3)]); hi = mathutils.Vector([max(v[i] for v in vs) for i in range(3)])
k = 1 / ((hi.z - lo.z) if mode == 'height' else max(hi - lo)); c = (lo + hi) / 2
for v in o.data.vertices: v.co = mathutils.Vector(((v.co.x - c.x) * k, (v.co.y - c.y) * k, (v.co.z - lo.z) * k))
for im in bpy.data.images:
    if im.size[0] > 1024: im.scale(1024, 1024)
for e in [e for e in bpy.context.scene.objects if e != o]: bpy.data.objects.remove(e)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='JPEG', export_image_quality=88, export_apply=True)
