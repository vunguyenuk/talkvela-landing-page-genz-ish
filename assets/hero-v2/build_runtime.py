"""Vendor the working V2 render package without pruning shared effects or assets."""
from pathlib import Path
import json
import re
import shutil

SOURCE = Path('/Users/vunguyen/Desktop/talkvela-landing-page-v2')
DEST = Path(__file__).resolve().parent / 'runtime'
PREFIX = '/assets/hero-v2/runtime'
ROOTS = ['/__external/', '/v1-components/', '/proportion-fixes.css',
         '/proportion-fixes.js', '/mobile-fixes.css']
ASSET_RENAMES = {}
FLIGHT = re.compile(r'<script>self\.__next_f\.push\((\[1,.*?\])\)</script>', re.S)


def relocate(text):
    for root in ROOTS:
        text = text.replace(root, PREFIX + root)
    for old, new in ASSET_RENAMES.items():
        text = text.replace(old, new)
    return text


def relocate_flight(stream):
    """Parse original byte boundaries before editing length-prefixed text rows."""
    raw = stream.encode('utf-8')
    rows = []
    offset = 0
    while offset < len(raw):
        colon = raw.index(b':', offset)
        if raw[colon + 1:colon + 2] == b'T':
            comma = raw.index(b',', colon + 2)
            size = int(raw[colon + 2:comma], 16)
            end = comma + 1 + size
            value = relocate(raw[comma + 1:end].decode('utf-8'))
            rows.append(raw[offset:colon + 2].decode('utf-8')
                        + format(len(value.encode('utf-8')), 'x') + ',' + value)
        else:
            end = raw.index(b'\n', colon) + 1
            rows.append(relocate(raw[offset:end].decode('utf-8')))
        offset = end
    assert offset == len(raw)
    return ''.join(rows)


def relocate_html(source):
    # Protect Flight scripts from the normal HTML URL rewrite; rewrite their
    # records separately so embedded CSS text retains valid UTF-8 byte lengths.
    flights = []
    def protect(match):
        payload = json.loads(match.group(1))
        payload[1] = relocate_flight(payload[1])
        encoded = json.dumps(payload, ensure_ascii=False).replace('<', '\\u003c')
        flights.append('<script>self.__next_f.push(' + encoded + ')</script>')
        return f'__TALKVELA_FLIGHT_{len(flights) - 1}__'
    html = relocate(FLIGHT.sub(protect, source))
    html = html.replace('<head>', '<head><script>window.TalkVelaPatternOnly=new URLSearchParams(location.search).has("pattern-only");if(window.TalkVelaPatternOnly)document.documentElement.classList.add("tv-pattern-only");</script>', 1)
    for index, script in enumerate(flights):
        html = html.replace(f'__TALKVELA_FLIGHT_{index}__', script)
    return html.replace('</head>', '<link rel="stylesheet" href="/assets/hero-v2/native.css?v=r60"/>'
                        '<script src="/assets/hero-v2/bridge.js?v=r60" defer></script>'
                        '<script src="/assets/hero-v2/hero-trail.js?v=r60" defer></script>'
                        '<script src="/assets/hero-v2/pattern-stage.js?v=r60" defer></script></head>')


def build():
    DEST.mkdir(exist_ok=True)
    for name in ['__external', 'v1-components']:
        source_dir = SOURCE / name
        for source in source_dir.rglob('*'):
            if not source.is_file():
                continue
            target = DEST / source.relative_to(SOURCE)
            target.parent.mkdir(parents=True, exist_ok=True)
            if source.suffix in ['.js', '.css', '.html', '.json']:
                target.write_text(relocate(source.read_text()))
            else:
                shutil.copy2(source, target)
    for name in ['proportion-fixes.css', 'proportion-fixes.js', 'mobile-fixes.css']:
        (DEST / name).write_text(relocate((SOURCE / name).read_text()))
    # Expose the original provider only in transparent pattern scenes. Normal
    # hero sessions retain their existing factory, asset list and children.
    html_source = (SOURCE / 'index.html').read_text()
    active = re.search(r'src="(/__external/[^" ]*/654-[^" ]+\.js)"', html_source).group(1)
    bundle = DEST / active.lstrip('/')
    shared = bundle.read_text()
    old_load = 'await ed.assetsManager.load(tt)'
    new_load = 'await ed.assetsManager.load(window.TalkVelaPatternOnly?{blueNoise:tt.blueNoise,ornaments:tt.ornaments,ornamentsJSON:tt.ornamentsJSON}:tt)'
    assert old_load in shared
    shared = shared.replace(old_load, new_load, 1)
    old_return = 'return(0,n.jsxs)(tr.Provider,{value:N,children:'
    new_return = 'window.TalkVelaPatternOnly&&(window.TalkVelaPatternAPI=N,window.TalkVelaPatternRoot={refresh:()=>{ed.dom3DMapper.onResize(),s&&s.scroll(0)}});' + old_return
    assert old_return in shared
    shared = shared.replace(old_return, new_return, 1)
    assert 'm&&t]})}function to()' in shared
    shared = shared.replace('m&&t]})}function to()', 'm&&(window.TalkVelaPatternOnly?null:t)]})}function to()', 1)
    revised_bundle = bundle.with_name(bundle.stem + '-native-r60.js')
    revised_bundle.write_text(shared)
    ASSET_RENAMES[bundle.name] = revised_bundle.name
    (DEST / 'index.html').write_text(relocate_html(html_source))
    print('Copied complete V2 render package with valid Flight text byte lengths.')


if __name__ == '__main__':
    build()
