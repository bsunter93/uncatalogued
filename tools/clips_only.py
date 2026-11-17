# Keep only the skeleton and its clips from an animated GLB, so extra clip sets cost almost nothing to download.
import bpy, sys
a = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=a[0])
for o in list(bpy.context.scene.objects):
    if o.type == 'MESH': bpy.data.objects.remove(o)
bpy.ops.export_scene.gltf(filepath=a[1], export_format='GLB', export_animations=True, export_animation_mode='ACTIONS', export_force_sampling=True, export_optimize_animation_size=True, export_skins=False)
