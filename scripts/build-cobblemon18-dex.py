#!/usr/bin/env python3
import gzip, io, json, os, re, urllib.request, zipfile
from collections import defaultdict
from pathlib import Path

VERSION_ID = os.environ.get('COBBLEMON_VERSION_ID', 'YgmyyFcs')
OUT_DIR = Path('public/data/cobblemon18')
BASE_FILE = Path('public/data/spawns.json.gz')
LOCAL_JAR = os.environ.get('COBBLEMON_JAR')

def humanize(v):
    s=str(v).lstrip('#').split(':')[-1].replace('is_','').replace('has_block/','')
    return ' '.join(x.capitalize() for x in re.split(r'[/_-]+',s) if x)

def as_list(v):
    if v is None: return []
    return v if isinstance(v,list) else [v]

def species_of(q):
    first=(q or '').split()[0]
    return first.split(':')[-1].lower()

def rest_query(q):
    parts=(q or '').split(maxsplit=1)
    return parts[1] if len(parts)>1 else ''

def cond_notes(c, anti=False):
    if not c: return []
    p='KHÔNG: ' if anti else ''
    out=[]
    for lo,hi,label in [('minSkyLight','maxSkyLight','Sky light'),('minLight','maxLight','Light'),('minY','maxY','Y'),('minX','maxX','X'),('minLureLevel','maxLureLevel','Lure level')]:
        if lo in c or hi in c: out.append(f"{p}{label}: {c.get(lo,'…')}–{c.get(hi,'…')}")
    skip={'biomes','structures','timeRange','minSkyLight','maxSkyLight','minLight','maxLight','minY','maxY','minX','maxX','minLureLevel','maxLureLevel'}
    labels={'canSeeSky':'Thấy bầu trời','isRaining':'Đang mưa','isThundering':'Có giông','isSlimeChunk':'Slime chunk','isPokeSnack':'Poké Snack','neededNearbyBlocks':'Block gần đó','neededBaseBlocks':'Block nền','moonPhase':'Moon phase','rodType':'Cần câu','bait':'Mồi câu'}
    for k,v in c.items():
        if k in skip: continue
        if isinstance(v,bool): val='Có' if v else 'Không'
        elif isinstance(v,(dict,list)): val=json.dumps(v,ensure_ascii=False,separators=(',',':'))
        else: val=str(v)
        out.append(f"{p}{labels.get(k,humanize(k))}: {val}")
    if anti:
        if c.get('biomes'): out.append('KHÔNG biome: '+', '.join(map(str,as_list(c['biomes']))))
        if c.get('structures'): out.append('KHÔNG structure: '+', '.join(map(str,as_list(c['structures']))))
        if c.get('timeRange'): out.append('KHÔNG thời gian: '+str(c['timeRange']))
    return out

def variant(s, q, level, labels, spawn_type='normal', extra=None, member_weight=None):
    cond=s.get('condition') or {}; anti=s.get('anticondition') or {}
    biomes=as_list(cond.get('biomes')); structures=as_list(cond.get('structures'))
    notes=cond_notes(cond)+cond_notes(anti,True)
    if rest_query(q): notes.insert(0,'Form/query: '+rest_query(q))
    if extra: notes.extend(extra)
    if s.get('weightMultiplier'): notes.append('Weight multiplier: '+json.dumps(s['weightMultiplier'],ensure_ascii=False,separators=(',',':')))
    for wm in s.get('weightMultipliers') or []: notes.append('Weight multiplier: '+json.dumps(wm,ensure_ascii=False,separators=(',',':')))
    return {'id':str(s.get('id') or species_of(q)),'b':biomes,'bl':[labels.get(x,humanize(x)) for x in biomes],'s':structures,'sl':[labels.get(x,humanize(x)) for x in structures],'l':level or '—','r':s.get('bucket','common'),'t':cond.get('timeRange','any'),'c':s.get('spawnablePositionType','grounded'),'p':s.get('presets') or [],'n':notes,'q':rest_query(q),'w':s.get('weight'),'mw':member_weight,'st':spawn_type}

def canonical_old(p):
    out=[]
    for v in p.get('variants',[]):
        x={'biomes':sorted(v.get('biomes') or []),'structures':sorted(v.get('structures') or []),'level':v.get('level'),'rarity':v.get('rarity'),'time':v.get('time'),'context':v.get('context'),'presets':sorted(v.get('presets') or [])}
        out.append(json.dumps(x,sort_keys=True,separators=(',',':')))
    return sorted(out)

def canonical_new(vs):
    out=[]
    for v in vs:
        x={'biomes':sorted(v['b']),'structures':sorted(v['s']),'level':v['l'],'rarity':v['r'],'time':v['t'],'context':v['c'],'presets':sorted(v['p'])}
        out.append(json.dumps(x,sort_keys=True,separators=(',',':')))
    return sorted(out)

def download_jar():
    if LOCAL_JAR: return Path(LOCAL_JAR).read_bytes()
    req=urllib.request.Request(f'https://api.modrinth.com/v2/version/{VERSION_ID}',headers={'User-Agent':'SVFrame-PokePortal/1.0'})
    with urllib.request.urlopen(req,timeout=30) as r: meta=json.load(r)
    files=meta.get('files') or []
    f=next((x for x in files if x.get('primary')),files[0] if files else None)
    if not f: raise RuntimeError('No Modrinth file found')
    print('Downloading',f['url'])
    req=urllib.request.Request(f['url'],headers={'User-Agent':'SVFrame-PokePortal/1.0'})
    with urllib.request.urlopen(req,timeout=120) as r: return r.read()

def main():
    with gzip.open(BASE_FILE,'rt',encoding='utf-8') as f: base=json.load(f)
    old={p['key']:p for p in base.get('pokemon',[])}
    labels={x['id']:x['label'] for x in base.get('locations',[])}
    normal=defaultdict(list); herds=defaultdict(list)
    with zipfile.ZipFile(io.BytesIO(download_jar())) as z:
        lang=json.loads(z.read('assets/cobblemon/lang/en_us.json'))
        species_names={k[len('cobblemon.species.'):-len('.name')]:v for k,v in lang.items() if k.startswith('cobblemon.species.') and k.endswith('.name')}
        for n in z.namelist():
            if not (n.startswith('data/cobblemon/spawn_pool_world/') and n.endswith('.json')): continue
            d=json.loads(z.read(n))
            if d.get('enabled') is False: continue
            for s in d.get('spawns',[]):
                if s.get('type')=='pokemon':
                    q=s.get('pokemon',''); normal[species_of(q)].append(variant(s,q,s.get('level'),labels,'normal'))
                elif s.get('type')=='pokemon-herd':
                    alpha='alpha' in str(s.get('id','')).lower()
                    for i,h in enumerate(s.get('herdablePokemon') or []):
                        q=h.get('pokemon',''); k=species_of(q)
                        extra=[f"Herd spawn · tối đa {s.get('maxHerdSize','?')} Pokémon"]
                        role=[]
                        if h.get('isLeader'): role.append('leader')
                        if h.get('isFollower'): role.append('follower')
                        if role: extra.append('Vai trò herd: '+', '.join(role))
                        if h.get('maxTimes') is not None: extra.append(f"Tối đa {h['maxTimes']} cá thể này/herd")
                        if h.get('levelRangeOffset'): extra.append('Level offset: '+str(h['levelRangeOffset']))
                        is_alpha=alpha or 'alpha=true' in q
                        if is_alpha: extra.insert(0,'ALPHA spawn')
                        v=variant(s,q,h.get('levelRange') or s.get('levelRange'),labels,'alpha-herd' if is_alpha else 'herd',extra,h.get('weight'))
                        v['id']=f"{v['id']}-member-{i+1}"; herds[k].append(v)
    replace=[]
    for k,vs in normal.items():
        if k not in old or canonical_old(old[k])!=canonical_new(vs): replace.append({'k':k,'name':species_names.get(k,old.get(k,{}).get('name',humanize(k))),'v':vs})
    append=[{'k':k,'name':species_names.get(k,old.get(k,{}).get('name',humanize(k))),'v':vs} for k,vs in herds.items()]
    OUT_DIR.mkdir(parents=True,exist_ok=True)
    for name,obj in [('normal-delta.json.gz',{'version':'1.8.0','replace':replace}),('herds.json.gz',{'version':'1.8.0','append':append})]:
        with gzip.open(OUT_DIR/name,'wt',encoding='utf-8',compresslevel=9) as f: json.dump(obj,f,ensure_ascii=False,separators=(',',':'))
    print(json.dumps({'normalChanged':len(replace),'herdSpecies':len(append),'herdConditions':sum(len(x['v']) for x in append)},ensure_ascii=False))

if __name__=='__main__': main()
