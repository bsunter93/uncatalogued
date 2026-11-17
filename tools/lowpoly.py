# Light versions of scenery for the far world. Usage: blender -b --python tools/lowpoly.py -- name ratio [name ratio ...]
import bpy, sys
args = sys.argv[sys.argv.index('--') + 1:]
for name, ratio in zip(args[0::2], args[1::2]):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=f'assets/models/{name}.glb')
    tris = 0
    for o in [o for o in bpy.data.objects if o.type == 'MESH']:
        bpy.context.view_layer.objects.active = o; m = o.modifiers.new('d', 'DECIMATE'); m.ratio = float(ratio); bpy.ops.object.modifier_apply(modifier='d'); o.data.calc_loop_triangles(); tris += len(o.data.loop_triangles)
    for im in bpy.data.images:
        if im.size[0] > 512: im.scale(512, 512)
    bpy.ops.export_scene.gltf(filepath=f'assets/models/{name}_lo.glb', export_format='GLB', export_image_format='JPEG', export_jpeg_quality=80)
    print('LOW', name, tris)
