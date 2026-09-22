import json
import urllib.request
import time

app_ids = {
    'valheim': '892970',
    'together-moon-escape': '3744430',
    'nine-sols': '1809540',
    'animal-well': '813230',
    'crow-country': '1996010',
    'lorelei-laser-eyes': '2008920',
    'indika': '1373960',
    'duck-detective': '2637090',
    'balatro': '2379780',
    'manor-lords': '1363080',
    'black-myth-wukong': '2358720',
    'hollow-knight': '367520',
    'persona-5-royal': '1687950',
    'elden-ring-shadow': '1245620'
}

with open('data/games.json', 'r', encoding='utf-8') as f:
    games = json.load(f)

for g in games:
    gid = g['id']
    if gid in app_ids:
        aid = app_ids[gid]
        try:
            url = f'https://store.steampowered.com/api/appdetails?appids={aid}'
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if data and aid in data and data[aid].get('success'):
                    ss = data[aid]['data'].get('screenshots', [])
                    g['screenshots'] = [s['path_full'] for s in ss[:5]]
                    print(f"{gid}: {len(g['screenshots'])} screenshots")
            time.sleep(0.3)
        except Exception as e:
            print(f"{gid} error: {e}")

with open('data/games.json', 'w', encoding='utf-8') as f:
    json.dump(games, f, ensure_ascii=False, indent=2)

with open('data/data_bundle.js', 'w', encoding='utf-8') as f:
    f.write('// Bundle dữ liệu offline phục vụ mở trực tiếp file:/// không qua HTTP server\n')
    f.write('window.FALLBACK_GAMES = ' + json.dumps(games, ensure_ascii=False, indent=2) + ';\n')

print('Done updating games.json and data_bundle.js!')
