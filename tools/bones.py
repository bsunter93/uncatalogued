import bpy, sys
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=sys.argv[sys.argv.index('--') + 1])
arm = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE'][0]
print('BONES', [(b.name, [round(v, 1) for v in (arm.matrix_world @ b.head_local)], [round(v, 1) for v in (arm.matrix_world @ b.tail_local)]) for b in arm.data.bones])
