# List the clips in an animated GLB and render one frame from the middle of a few of them.
import bpy, sys, math, mathutils
a = sys.argv[sys.argv.index('--') + 1:]; src, out = a[0], a[1]; want = [int(x) for x in a[2:]]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=src)
arm = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE'][0]
acts = list(bpy.data.actions)
print('CLIPS', [(i, x.name, int(x.frame_range[1] - x.frame_range[0])) for i, x in enumerate(acts)])
print('BONES', len(arm.data.bones), 'ARM scale', [round(v, 3) for v in arm.scale], 'rot', [round(v, 2) for v in arm.rotation_euler], 'fps', bpy.context.scene.render.fps)
ms = [o for o in bpy.context.scene.objects if o.type == 'MESH']
print('MESH', [(o.name, [round(v, 2) for v in o.dimensions]) for o in ms])
sc = bpy.context.scene; eng = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]; sc.render.engine = 'BLENDER_EEVEE' if 'BLENDER_EEVEE' in eng else 'BLENDER_EEVEE_NEXT'
sc.render.resolution_x = 420; sc.render.resolution_y = 520
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.5, .5, .55, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 1.2
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sun.data.energy = 3; sun.rotation_euler = (math.radians(50), 0, math.radians(30)); sc.collection.objects.link(sun)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = 50
H = max(o.dimensions.z for o in ms) or 1.7
cam.location = (H * 1.3, -H * 2.6, H * .75); cam.rotation_euler = (mathutils.Vector((0, 0, H * .5)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
if not arm.animation_data: arm.animation_data_create()
for i in want:
    act = acts[i]; arm.animation_data.action = act
    try:
        if hasattr(arm.animation_data, 'action_slot') and act.slots: arm.animation_data.action_slot = act.slots[0]
    except Exception as e: print('slot', e)
    sc.frame_set(int((act.frame_range[0] + act.frame_range[1]) * .45)); sc.render.filepath = out.replace('.png', f'_{i}.png'); bpy.ops.render.render(write_still=True)
