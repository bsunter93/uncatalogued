# Prepare a rigged, animated Meshy GLB for the game: drop helper meshes, 1K texture, keep every clip.
import bpy, sys
a = sys.argv[sys.argv.index('--') + 1:]; src, out = a[0], a[1]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=src)
for o in list(bpy.context.scene.objects):
    if o.type == 'MESH' and not any(m.type == 'ARMATURE' for m in o.modifiers): bpy.data.objects.remove(o)
for im in bpy.data.images:
    if im.size[0] > 1024: im.scale(1024, 1024)
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='JPEG', export_image_quality=88, export_animations=True, export_animation_mode='ACTIONS', export_force_sampling=True, export_optimize_animation_size=True)
