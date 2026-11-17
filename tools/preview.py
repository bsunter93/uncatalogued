# Render two views of a GLB for review. Usage: blender -b --python tools/preview.py -- in.glb out.png
import bpy, sys, math, mathutils
src, out = sys.argv[sys.argv.index('--') + 1:][:2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
ms = [o for o in bpy.context.scene.objects if o.type == 'MESH']
lo = mathutils.Vector((1e9,) * 3); hi = mathutils.Vector((-1e9,) * 3); tris = 0
for o in ms:
    tris += sum(len(p.vertices) - 2 for p in o.data.polygons)
    for c in o.bound_box:
        w = o.matrix_world @ mathutils.Vector(c)
        for i in range(3): lo[i] = min(lo[i], w[i]); hi[i] = max(hi[i], w[i])
c = (lo + hi) / 2; size = max(hi - lo)
print('STATS tris', tris, 'size', [round(v, 2) for v in (hi - lo)], 'meshes', len(ms), 'armatures', len([o for o in bpy.context.scene.objects if o.type == 'ARMATURE']), 'images', [(i.name, i.size[0]) for i in bpy.data.images])
sc = bpy.context.scene; sc.render.engine = 'BLENDER_EEVEE' if 'BLENDER_EEVEE' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE_NEXT'
sc.render.resolution_x = 640; sc.render.resolution_y = 760; sc.render.film_transparent = False
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.5, .5, .55, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 1.1
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sun.data.energy = 3; sun.rotation_euler = (math.radians(50), 0, math.radians(30)); sc.collection.objects.link(sun)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = 60
for i, ang in enumerate((25, 205)):
    a = math.radians(ang); d = size * 2.6
    cam.location = (c.x + math.sin(a) * d, c.y - math.cos(a) * d, c.z + size * .35)
    cam.rotation_euler = (c - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = out.replace('.png', f'_{i}.png'); bpy.ops.render.render(write_still=True)
