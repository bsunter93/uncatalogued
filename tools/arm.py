# Put separate weapon models into a rigged hero's hands and export one animated GLB.
# Usage: blender -b --python tools/arm.py -- body_anim.glb out.glb preview.png  weapon.glb:kind[:flip] ...
import bpy, sys, math, mathutils
from mathutils import Vector, Matrix
a = sys.argv[sys.argv.index('--') + 1:]; body, out, prev, weps = a[0], a[1], a[2], a[3:]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=body)
for o in list(bpy.context.scene.objects):
    if o.type == 'MESH' and not any(m.type == 'ARMATURE' for m in o.modifiers): bpy.data.objects.remove(o)
arm = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE'][0]; skin = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]
if arm.animation_data: arm.animation_data.action = None
for pb in arm.pose.bones: pb.matrix_basis = Matrix.Identity(4)
bpy.context.view_layer.update()
W = arm.matrix_world; bone = lambda n: arm.data.bones[n]; head = lambda n: W @ bone(n).head_local
H = max((skin.matrix_world @ Vector(c)).z for c in skin.bound_box) - min((skin.matrix_world @ Vector(c)).z for c in skin.bound_box)
def palm(side): w, e = head(side + 'Hand'), head(side + 'ForeArm'); return w + (w - e).normalized() * H * .055
def load(path, single=False):
    before = set(bpy.context.scene.objects); bpy.ops.import_scene.gltf(filepath=path); new = [o for o in bpy.context.scene.objects if o not in before]; ms = [o for o in new if o.type == 'MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in ms: o.select_set(True)
    bpy.context.view_layer.objects.active = ms[0]
    if len(ms) > 1: bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active; bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM'); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    for e in new:
        if e != o and e.name in bpy.data.objects: bpy.data.objects.remove(e)
    if single:  # the generator sometimes returns two copies side by side; keep the bigger one
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.separate(type='LOOSE'); bpy.ops.object.mode_set(mode='OBJECT')
        parts = [p for p in bpy.context.selected_objects if p.type == 'MESH']
        cen = lambda p: sum((v.co for v in p.data.vertices), Vector()) / max(1, len(p.data.vertices))
        big = sorted(parts, key=lambda p: -len(p.data.vertices)); c0 = cen(big[0]); allv = [v.co for p in parts for v in p.data.vertices]
        ext = [max(v[i] for v in allv) - min(v[i] for v in allv) for i in range(3)]; far = [p for p in big[1:] if len(p.data.vertices) > len(big[0].data.vertices) * .3]
        if far:
            c1 = cen(far[0]); ax = max(range(3), key=lambda i: abs(c1[i] - c0[i])); mid = (c0[ax] + c1[ax]) / 2; keep = [p for p in parts if (cen(p)[ax] - mid) * (c0[ax] - mid) > 0]
        else: keep = parts
        for p in parts:
            if p not in keep: bpy.data.objects.remove(p)
        bpy.ops.object.select_all(action='DESELECT')
        for p in keep: p.select_set(True)
        bpy.context.view_layer.objects.active = keep[0]
        if len(keep) > 1: bpy.ops.object.join()
        o = bpy.context.view_layer.objects.active; print('SPLIT kept', len(keep), 'of', len(parts))
    return o
def axes(o):  # returns verts and axis indices sorted long, mid, thin
    vs = [v.co.copy() for v in o.data.vertices]; lo = Vector([min(v[i] for v in vs) for i in range(3)]); hi = Vector([max(v[i] for v in vs) for i in range(3)]); d = hi - lo
    order = sorted(range(3), key=lambda i: -d[i]); return vs, lo, hi, d, order
def place(o, R, s, t):  # bake rotation R, scale s, translation t into the mesh
    for v in o.data.vertices: v.co = (R @ v.co) * s + t
    o.data.update()
def basis(x, y, z): M = Matrix((x, y, z)).transposed(); return M
for spec in weps:
    path, kind, *flag = spec.split(':'); flip = 'flip' in flag; o = load(path, kind == 'shield'); vs, lo, hi, d, (L, M, T) = axes(o); c = (lo + hi) / 2
    for v in o.data.vertices: v.co -= c
    vs = [v.co.copy() for v in o.data.vertices]; e = [Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))]
    topv = [v for v in vs if v[L] > d[L] * .28]; botv = [v for v in vs if v[L] < -d[L] * .28]
    spread = lambda P: max((abs(v[M]) + abs(v[T])) for v in P) if P else 0
    up = 1 if spread(topv) >= spread(botv) else -1  # the wide end is the head
    if kind == 'bow': up = 1
    if flip: up = -up
    if kind == 'hammer':
        n = H * .78 / d[L]; dirv = Vector((0, -math.cos(math.radians(40)), math.sin(math.radians(40)))); side = Vector((1, 0, 0)); third = dirv.cross(side)
        R = basis(side, third, dirv) @ basis(e[M], e[T], e[L] * up).inverted(); place(o, R, n, Vector((0, 0, 0))); place(o, Matrix.Identity(3), 1, palm('Right') + dirv * (d[L] * n * .22)); bn = 'RightHand'
    elif kind == 'staff':
        n = H * 1.12 / d[L]; R = basis(Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))) @ basis(e[M], e[T] * (1 if True else 1), e[L] * up).inverted(); place(o, R, n, Vector((0, 0, 0)))
        p = palm('Right'); place(o, Matrix.Identity(3), 1, Vector((p.x, p.y - H * .03, d[L] * n / 2 + H * .01))); bn = 'RightHand'
    elif kind == 'bow':
        mid = [v for v in vs if abs(v[L]) < d[L] * .15]; tips = [v for v in vs if abs(v[L]) > d[L] * .42]
        fwd = 1 if (sum(v[M] for v in mid) / len(mid)) >= (sum(v[M] for v in tips) / len(tips)) else -1
        if flip: fwd = -fwd
        n = H * .86 / d[L]
        # carried at the side, limbs front to back, belly down: when the arm comes up to shoot, the bow stands upright facing forward
        R = basis(Vector((1, 0, 0)), Vector((0, 0, -1)), Vector((0, -1, 0))) @ basis(e[T], e[M] * fwd, e[L]).inverted(); place(o, R, n, Vector((0, 0, 0)))
        p = palm('Left'); gm = sum((R @ v)[2] for v in mid) / len(mid) * n; place(o, Matrix.Identity(3), 1, Vector((p.x, p.y, p.z - gm))); bn = 'LeftHand'
    elif kind == 'shield':
        n = H * .5 / d[L]; R = basis(Vector((0, 1, 0)), Vector((0, 0, 1)), Vector((1 if not flip else -1, 0, 0))) @ basis(e[L], e[M], e[T]).inverted(); place(o, R, n, Vector((0, 0, 0)))
        p = (head('LeftForeArm') + head('LeftHand')) / 2; place(o, Matrix.Identity(3), 1, Vector((p.x + H * .07, p.y, p.z))); bn = 'LeftForeArm'
    o.name = 'weapon_' + kind; mw = o.matrix_world.copy(); o.parent = arm; o.parent_type = 'BONE'; o.parent_bone = bn; bpy.context.view_layer.update(); o.matrix_world = mw
for im in bpy.data.images:
    if im.size[0] > 1024: im.scale(1024, 1024)
    elif im.size[0] > 512 and 'weapon' not in im.name and im.users and all(u.name.startswith('weapon') for u in bpy.data.objects if u.type == 'MESH' and any(s.material and s.material.node_tree and any(nd.type == 'TEX_IMAGE' and nd.image == im for nd in s.material.node_tree.nodes) for s in u.material_slots)): im.scale(512, 512)
# preview: rest pose plus mid-frames of a few clips
sc = bpy.context.scene; eng = [x.identifier for x in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]; sc.render.engine = 'BLENDER_EEVEE' if 'BLENDER_EEVEE' in eng else 'BLENDER_EEVEE_NEXT'
sc.render.resolution_x = 440; sc.render.resolution_y = 520
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.5, .5, .55, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 1.2
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sun.data.energy = 3; sun.rotation_euler = (math.radians(50), 0, math.radians(30)); sc.collection.objects.link(sun)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = 50
cam.location = (H * 1.5, -H * 2.9, H * .9); cam.rotation_euler = (Vector((0, 0, H * .55)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
sc.render.filepath = prev.replace('.png', '_rest.png'); bpy.ops.render.render(write_still=True)
if not arm.animation_data: arm.animation_data_create()
names = []
for act in bpy.data.actions:
    if not any(k in act.name for k in ('Stance', 'Idle', 'Slash', 'Archery', 'Spell_Cast', 'Push', 'Bow_Aimed', 'Block')): continue
    arm.animation_data.action = act
    try:
        if hasattr(arm.animation_data, 'action_slot') and act.slots: arm.animation_data.action_slot = act.slots[0]
    except Exception as ex: print('slot', ex)
    for fr in ((.25, .45, .65) if any(k in act.name for k in ('Slash', 'Archery', 'Spell_Cast', 'Push')) else (.45,)):
        sc.frame_set(int(act.frame_range[0] + (act.frame_range[1] - act.frame_range[0]) * fr)); sc.render.filepath = prev.replace('.png', '_' + act.name + '_' + str(int(fr * 100)) + '.png'); bpy.ops.render.render(write_still=True)
    names.append(act.name)
print('PREVIEWS', names)
arm.animation_data.action = None
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='JPEG', export_image_quality=88, export_animations=True, export_animation_mode='ACTIONS', export_force_sampling=True, export_optimize_animation_size=True)
