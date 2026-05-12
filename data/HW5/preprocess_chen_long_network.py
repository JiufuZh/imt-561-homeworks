from pathlib import Path
import csv, json, re, shutil, zipfile, math
from collections import defaultdict, Counter

ROOT = Path('/mnt/data')
OUT = ROOT / 'chen_long_hwk5_network'
RAW = OUT / 'raw'
DATA = OUT / 'data'
for d in [OUT, RAW, DATA]:
    d.mkdir(parents=True, exist_ok=True)

FILES = [
    ('CHEN_Long_CHOU_Tien_Chen_Denmark_Open_2019_QuarterFinal_set1.csv', {
        'match_id': 'denmark_open_2019_qf_chou',
        'match_label': 'Denmark Open 2019 QF',
        'tournament': 'Denmark Open', 'year': 2019, 'round': 'Quarterfinal',
        'game_id': 1, 'player_A': 'Chen Long', 'player_B': 'Chou Tien Chen', 'chen_role': 'A', 'opponent': 'Chou Tien Chen'
    }),
    ('CHEN_Long_CHOU_Tien_Chen_Denmark_Open_2019_QuarterFinal_set2.csv', {
        'match_id': 'denmark_open_2019_qf_chou',
        'match_label': 'Denmark Open 2019 QF',
        'tournament': 'Denmark Open', 'year': 2019, 'round': 'Quarterfinal',
        'game_id': 2, 'player_A': 'Chen Long', 'player_B': 'Chou Tien Chen', 'chen_role': 'A', 'opponent': 'Chou Tien Chen'
    }),
    ('CHEN_Long_CHOU_Tien_Chen_World_Tour_Finals_Group_Stage_set1.csv', {
        'match_id': 'world_tour_finals_2019_group_chou',
        'match_label': 'World Tour Finals 2019 Group',
        'tournament': 'World Tour Finals', 'year': 2019, 'round': 'Group Stage',
        'game_id': 1, 'player_A': 'Chen Long', 'player_B': 'Chou Tien Chen', 'chen_role': 'A', 'opponent': 'Chou Tien Chen'
    }),
    ('CHEN_Long_CHOU_Tien_Chen_World_Tour_Finals_Group_Stage_set2.csv', {
        'match_id': 'world_tour_finals_2019_group_chou',
        'match_label': 'World Tour Finals 2019 Group',
        'tournament': 'World Tour Finals', 'year': 2019, 'round': 'Group Stage',
        'game_id': 2, 'player_A': 'Chen Long', 'player_B': 'Chou Tien Chen', 'chen_role': 'A', 'opponent': 'Chou Tien Chen'
    }),
    ('Viktor_AXELSEN_CHEN_Long_Malaysia_Masters_2020_QuarterFinals_set1.csv', {
        'match_id': 'malaysia_masters_2020_qf_axelsen',
        'match_label': 'Malaysia Masters 2020 QF',
        'tournament': 'Malaysia Masters', 'year': 2020, 'round': 'Quarterfinal',
        'game_id': 1, 'player_A': 'Viktor Axelsen', 'player_B': 'Chen Long', 'chen_role': 'B', 'opponent': 'Viktor Axelsen'
    }),
    ('Viktor_AXELSEN_CHEN_Long_Malaysia_Masters_2020_QuarterFinals_set2.csv', {
        'match_id': 'malaysia_masters_2020_qf_axelsen',
        'match_label': 'Malaysia Masters 2020 QF',
        'tournament': 'Malaysia Masters', 'year': 2020, 'round': 'Quarterfinal',
        'game_id': 2, 'player_A': 'Viktor Axelsen', 'player_B': 'Chen Long', 'chen_role': 'B', 'opponent': 'Viktor Axelsen'
    }),
    ('Viktor_AXELSEN_CHEN_Long_Malaysia_Masters_2020_QuarterFinals_set3.csv', {
        'match_id': 'malaysia_masters_2020_qf_axelsen',
        'match_label': 'Malaysia Masters 2020 QF',
        'tournament': 'Malaysia Masters', 'year': 2020, 'round': 'Quarterfinal',
        'game_id': 3, 'player_A': 'Viktor Axelsen', 'player_B': 'Chen Long', 'chen_role': 'B', 'opponent': 'Viktor Axelsen'
    }),
]

# copy raws into project for reproducibility
for fname, meta in FILES:
    src = ROOT / fname
    if src.exists():
        shutil.copy(src, RAW / fname)


def norm_shot(s):
    t = (s or '').strip().lower().replace('_', ' ')
    t = re.sub(r'\s+', ' ', t)
    if not t: return 'Unknown'
    if 'serve' in t: return 'Short Serve' if 'short' in t else 'Serve'
    if 'half smash' in t: return 'Smash'
    if 'smash' in t: return 'Smash'
    if 'net block' in t or 'block net' in t: return 'Net Block'
    if 'hook' in t: return 'Net Hook'
    if 'net shot' in t or t == 'net': return 'Net Shot'
    if 'cross' in t and 'net' in t: return 'Cross-court Net Shot'
    if 'lift' in t: return 'Lift'
    if 'clear' in t or 'long shot' in t or 'long ball' in t: return 'Clear'
    if 'drop' in t or 'slice' in t: return 'Drop'
    if 'push' in t: return 'Push'
    if 'drive' in t: return 'Drive'
    if 'defensive' in t: return 'Defensive Return'
    return ' '.join(w.capitalize() for w in t.split())


def norm_reason(s):
    t = (s or '').strip().lower()
    t = re.sub(r'[-_]+', ' ', t)
    t = re.sub(r'\s+', ' ', t)
    if not t: return ''
    # winner labels
    if 'landing winner' in t or t == 'winner' or 'opponent winner' in t:
        return 'Winner'
    if 'out of bounds' in t or re.search(r'\bout\b', t):
        return 'Opponent Out'
    if 'hit the net' in t or 'net error' in t:
        return 'Opponent Hit Net'
    if 'failed to cross' in t or 'did not cross' in t or 'not cross' in t:
        return 'Opponent Failed to Cross Net'
    if 'judgment' in t or 'judgement' in t or 'misjudg' in t:
        return 'Opponent Misjudged Landing'
    return ' '.join(w.capitalize() for w in t.split())


def opponent_point_label(reason):
    # When the opponent wins, "Opponent Out" in win_reason means Chen Long made that mistake.
    mapping = {
        'Opponent Out': 'Chen Out',
        'Opponent Hit Net': 'Chen Hit Net',
        'Opponent Failed to Cross Net': 'Chen Failed to Cross Net',
        'Opponent Misjudged Landing': 'Chen Misjudged Landing',
        'Winner': 'Opponent Winner',
    }
    return mapping.get(reason, reason)


def to_int(x):
    try: return int(float(x))
    except Exception: return None

def to_float(x):
    try:
        if x is None or x == '': return None
        return float(x)
    except Exception:
        return None

all_rows = []
rally_rows = []
game_rows = []
metadata_rows = []

for fname, meta in FILES:
    path = ROOT / fname
    if not path.exists():
        raise FileNotFoundError(path)
    with open(path, encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        orig_fields = reader.fieldnames or []
    token_name = {'A': meta['player_A'], 'B': meta['player_B']}
    chen_role = meta['chen_role']
    opp_role = 'B' if chen_role == 'A' else 'A'
    for r in rows:
        player = r.get('player','')
        gp = r.get('getpoint_player','')
        r2 = dict(r)
        r2.update({
            'source_file': fname,
            'match_id': meta['match_id'],
            'match_label': meta['match_label'],
            'tournament': meta['tournament'],
            'year': meta['year'],
            'round': meta['round'],
            'game_id': meta['game_id'],
            'player_A_name': meta['player_A'],
            'player_B_name': meta['player_B'],
            'chen_role': chen_role,
            'opponent_role': opp_role,
            'opponent_name': meta['opponent'],
            'shot_by_name': token_name.get(player, player),
            'is_chen_shot': str(player == chen_role).upper(),
            'shot_type_clean': norm_shot(r.get('type')),
            'point_winner_name': token_name.get(gp, '') if gp else '',
            'point_won_by_chen': str(gp == chen_role).upper() if gp else '',
            'win_reason_clean': norm_reason(r.get('win_reason')),
            'lose_reason_clean': norm_reason(r.get('lose_reason')),
        })
        all_rows.append(r2)
    # group rows by rally and build rally summaries
    by_rally = defaultdict(list)
    for r in rows:
        rid = to_int(r.get('rally'))
        if rid is not None:
            by_rally[rid].append(r)
    prev_a, prev_b = 0, 0
    observed_rids = sorted(by_rally)
    inferred_count = 0
    unknown_count = 0
    for rid in observed_rids:
        group = by_rally[rid]
        # sort by ball_round, safely
        group.sort(key=lambda x: to_float(x.get('ball_round')) or 0)
        last = group[-1]
        score_a = to_int(last.get('roundscore_A')) or 0
        score_b = to_int(last.get('roundscore_B')) or 0
        gp = ''
        for rr in reversed(group):
            if rr.get('getpoint_player'):
                gp = rr.get('getpoint_player')
                break
        inferred = False
        da, db = score_a - prev_a, score_b - prev_b
        if not gp:
            if da == 1 and db == 0:
                gp = 'A'; inferred = True
            elif db == 1 and da == 0:
                gp = 'B'; inferred = True
            else:
                gp = ''
        if inferred:
            inferred_count += 1
        if not gp:
            unknown_count += 1
        point_winner_name = token_name.get(gp,'') if gp else ''
        chen_score = score_a if chen_role == 'A' else score_b
        opp_score = score_b if chen_role == 'A' else score_a
        prev_chen = prev_a if chen_role == 'A' else prev_b
        prev_opp = prev_b if chen_role == 'A' else prev_a
        # reason on final row with point winner if possible
        reason_row = next((rr for rr in reversed(group) if rr.get('getpoint_player')), last)
        win_reason = norm_reason(reason_row.get('win_reason'))
        if gp == chen_role:
            chen_reason = win_reason
            opp_reason = ''
        elif gp == opp_role:
            chen_reason = ''
            opp_reason = opponent_point_label(win_reason)
        else:
            chen_reason = opp_reason = ''
        rally_rows.append({
            'source_file': fname,
            'match_id': meta['match_id'],
            'match_label': meta['match_label'],
            'tournament': meta['tournament'],
            'year': meta['year'],
            'round': meta['round'],
            'game_id': meta['game_id'],
            'rally': rid,
            'rally_length': len(group),
            'chen_role': chen_role,
            'opponent_name': meta['opponent'],
            'chen_score_after': chen_score,
            'opponent_score_after': opp_score,
            'chen_score_before_observed': prev_chen,
            'opponent_score_before_observed': prev_opp,
            'point_winner_token': gp,
            'point_winner_name': point_winner_name,
            'point_won_by_chen': str(gp == chen_role).upper() if gp else '',
            'winner_inferred_from_score': str(inferred).upper(),
            'last_shot_by': token_name.get(last.get('player'), last.get('player')),
            'last_shot_type': norm_shot(last.get('type')),
            'win_reason_clean': win_reason,
            'chen_scoring_reason': chen_reason,
            'opponent_scoring_reason': opp_reason,
        })
        prev_a, prev_b = score_a, score_b
    # game summary
    final_a, final_b = 0, 0
    if rows:
        final_a = to_int(rows[-1].get('roundscore_A')) or 0
        final_b = to_int(rows[-1].get('roundscore_B')) or 0
    chen_final = final_a if chen_role == 'A' else final_b
    opp_final = final_b if chen_role == 'A' else final_a
    expected_points = final_a + final_b
    missing = max(0, expected_points - len(observed_rids))
    game_rows.append({
        'source_file': fname,
        'match_id': meta['match_id'],
        'match_label': meta['match_label'],
        'tournament': meta['tournament'],
        'year': meta['year'],
        'round': meta['round'],
        'game_id': meta['game_id'],
        'player_A_name': meta['player_A'],
        'player_B_name': meta['player_B'],
        'chen_role': chen_role,
        'opponent_name': meta['opponent'],
        'chen_score': chen_final,
        'opponent_score': opp_final,
        'chen_game_won': str(chen_final > opp_final).upper(),
        'scoreline_chen_first': f'{chen_final}–{opp_final}',
        'observed_rallies': len(observed_rids),
        'expected_points': expected_points,
        'missing_rally_rows': missing,
        'inferred_winners': inferred_count,
        'unknown_winners': unknown_count,
        'total_shots': len(rows),
        'avg_rally_length': round(len(rows)/len(observed_rids), 2) if observed_rids else 0,
    })

# write CSV outputs

def write_csv(path, rows):
    if not rows:
        return
    fields=[]
    for r in rows:
        for k in r.keys():
            if k not in fields: fields.append(k)
    with open(path, 'w', encoding='utf-8-sig', newline='') as f:
        w=csv.DictWriter(f, fieldnames=fields)
        w.writeheader(); w.writerows(rows)

write_csv(DATA/'all_shots_organized.csv', all_rows)
write_csv(DATA/'rally_summary.csv', rally_rows)
write_csv(DATA/'game_summary.csv', game_rows)

# Build match summaries
match_summaries = []
for mid in sorted(set(g['match_id'] for g in game_rows)):
    games = [g for g in game_rows if g['match_id']==mid]
    games.sort(key=lambda x: int(x['game_id']))
    opponent = games[0]['opponent_name']
    match_label = games[0]['match_label']
    scoreline = ', '.join(g['scoreline_chen_first'] for g in games)
    chen_games = sum(1 for g in games if g['chen_game_won']=='TRUE')
    opp_games = len(games)-chen_games
    match_summaries.append({
        'match_id': mid,
        'match_label': match_label,
        'opponent_name': opponent,
        'scoreline': scoreline,
        'chen_games_won': chen_games,
        'opponent_games_won': opp_games,
        'chen_match_won': chen_games > opp_games,
        'games': games,
    })

# Opponent summaries for visualization
def top_counter_items(counter, topn=6):
    total = sum(counter.values())
    out=[]
    for k,v in counter.most_common(topn):
        out.append({'label': k, 'count': v, 'pct': round(v/total*100,1) if total else 0})
    return out

opponents = []
for opp in sorted(set(g['opponent_name'] for g in game_rows)):
    ogames = [g for g in game_rows if g['opponent_name']==opp]
    omatches = [m for m in match_summaries if m['opponent_name']==opp]
    orallies = [r for r in rally_rows if r['opponent_name']==opp]
    oshots = [r for r in all_rows if r['opponent_name']==opp]
    chen_points = sum(1 for r in orallies if r['point_won_by_chen']=='TRUE')
    opp_points = sum(1 for r in orallies if r['point_won_by_chen']=='FALSE')
    chen_games_won = sum(1 for g in ogames if g['chen_game_won']=='TRUE')
    opp_games_won = len(ogames)-chen_games_won
    # counters
    chen_reason_ctr = Counter(r['chen_scoring_reason'] for r in orallies if r.get('chen_scoring_reason'))
    opp_reason_ctr = Counter(r['opponent_scoring_reason'] for r in orallies if r.get('opponent_scoring_reason'))
    chen_shot_ctr = Counter(r['shot_type_clean'] for r in oshots if r['is_chen_shot']=='TRUE' and r['shot_type_clean']!='Unknown')
    opp_shot_ctr = Counter(r['shot_type_clean'] for r in oshots if r['is_chen_shot']=='FALSE' and r['shot_type_clean']!='Unknown')
    # top shot types by total, for side-by-side bars
    total_types = Counter()
    for k,v in chen_shot_ctr.items(): total_types[k]+=v
    for k,v in opp_shot_ctr.items(): total_types[k]+=v
    shot_types = []
    for k,_ in total_types.most_common(8):
        shot_types.append({'type': k, 'chen': chen_shot_ctr.get(k,0), 'opponent': opp_shot_ctr.get(k,0)})
    # landing points, limited to keep JSON small but enough for map
    landing_points = []
    for row in oshots:
        lx = to_float(row.get('landing_x'))
        ly = to_float(row.get('landing_y'))
        if lx is not None and ly is not None:
            landing_points.append({
                'x': lx, 'y': ly,
                'player': 'Chen Long' if row['is_chen_shot']=='TRUE' else opp,
                'isChen': row['is_chen_shot']=='TRUE',
                'type': row['shot_type_clean'],
                'game': int(row['game_id']),
                'match_id': row['match_id'],
            })
    # score progression per game
    progress = []
    for g in ogames:
        gr = [r for r in orallies if r['source_file']==g['source_file']]
        gr.sort(key=lambda x: int(x['rally']))
        progress.append({
            'match_id': g['match_id'], 'match_label': g['match_label'], 'game_id': int(g['game_id']),
            'scoreline': g['scoreline_chen_first'],
            'chen_game_won': g['chen_game_won']=='TRUE',
            'points': [{'rally': int(r['rally']), 'chen': int(r['chen_score_after']), 'opponent': int(r['opponent_score_after']), 'rallyLength': int(r['rally_length']), 'winner': 'Chen Long' if r['point_won_by_chen']=='TRUE' else opp if r['point_won_by_chen']=='FALSE' else 'Unknown'} for r in gr]
        })
    top_reason = top_counter_items(chen_reason_ctr, 1)[0] if chen_reason_ctr else {'label':'', 'pct':0, 'count':0}
    top_opp_reason = top_counter_items(opp_reason_ctr, 1)[0] if opp_reason_ctr else {'label':'', 'pct':0, 'count':0}
    opponents.append({
        'id': re.sub(r'[^a-z0-9]+','_',opp.lower()).strip('_'),
        'name': opp,
        'matches': len(omatches),
        'games': len(ogames),
        'chenGamesWon': chen_games_won,
        'opponentGamesWon': opp_games_won,
        'chenPoints': chen_points,
        'opponentPoints': opp_points,
        'chenPointWinRate': round(chen_points/(chen_points+opp_points)*100,1) if (chen_points+opp_points) else 0,
        'chenGameWinRate': round(chen_games_won/len(ogames)*100,1) if ogames else 0,
        'observedRallies': sum(int(g['observed_rallies']) for g in ogames),
        'expectedPoints': sum(int(g['expected_points']) for g in ogames),
        'missingRallyRows': sum(int(g['missing_rally_rows']) for g in ogames),
        'inferredWinners': sum(int(g['inferred_winners']) for g in ogames),
        'totalShots': sum(int(g['total_shots']) for g in ogames),
        'avgRallyLength': round(sum(int(g['total_shots']) for g in ogames) / sum(int(g['observed_rallies']) for g in ogames), 2) if sum(int(g['observed_rallies']) for g in ogames) else 0,
        'topChenReason': top_reason,
        'topOpponentReason': top_opp_reason,
        'chenScoringReasons': top_counter_items(chen_reason_ctr, 6),
        'opponentScoringReasons': top_counter_items(opp_reason_ctr, 6),
        'shotTypes': shot_types,
        'matchesDetail': [m for m in omatches],
        'scoreProgression': progress,
        'landingPoints': landing_points,
        'narrative': '',
    })

# Add data-derived narrative sentence
for o in opponents:
    if o['name'] == 'Chou Tien Chen':
        o['narrative'] = f"Chen Long controlled the Chou matchup: {o['chenGamesWon']}–{o['opponentGamesWon']} in games, with his most common scoring pattern being {o['topChenReason']['label']} ({o['topChenReason']['pct']}%)."
    else:
        o['narrative'] = f"Against Axelsen, the story flips: Chen Long won only {o['chenGamesWon']} of {o['games']} games, and the opponent's top point pattern was {o['topOpponentReason']['label']} ({o['topOpponentReason']['pct']}%)."

viz = {
    'title': "Chen Long's Matchup Network",
    'subtitle': 'Click an opponent to reveal how the pattern changes across seven games.',
    'datasetNote': 'Seven games from three Chen Long matches: Denmark Open 2019 QF, World Tour Finals 2019 Group Stage, and Malaysia Masters 2020 QF.',
    'chen': {'id': 'chen_long', 'name': 'Chen Long', 'games': len(game_rows), 'matches': len(match_summaries)},
    'opponents': opponents,
    'encoding': {
        'nodeSize': 'Opponent node size represents observed rallies.',
        'edgeWidth': 'Line width represents observed rallies.',
        'selectedEdgeLabel': "Selected edge shows Chen Long's top scoring pattern against that opponent.",
        'dim': 'Non-selected opponents fade so the chosen matchup becomes the narrative focus.'
    }
}

# write summaries
write_csv(DATA/'opponent_summary.csv', [{k:v for k,v in o.items() if not isinstance(v,(list,dict))} | {'top_chen_reason': o['topChenReason']['label'], 'top_chen_reason_pct': o['topChenReason']['pct'], 'top_opponent_reason': o['topOpponentReason']['label'], 'top_opponent_reason_pct': o['topOpponentReason']['pct']} for o in opponents])
write_csv(DATA/'match_summary.csv', [{k:v for k,v in m.items() if k!='games'} for m in match_summaries])

with open(DATA/'chen_long_network_data.json', 'w', encoding='utf-8') as f:
    json.dump(viz, f, indent=2, ensure_ascii=False)

# Processing script for reproducibility: copy this script into project root
shutil.copy(Path(__file__), OUT/'preprocess_chen_long_network.py')

# Create p5.js sketch
sketch = r'''let data;
let selectedOpponent = null;
let hoveredOpponent = null;
let selectedGame = "All";
let chenNode;
let opponentNodes = [];
let particles = [];

const C = {
  bg: "#06131f",
  card: "#0d1d2b",
  card2: "#102638",
  line: "#385067",
  chen: "#f6c843",
  red: "#ff5c7a",
  cyan: "#35d5d9",
  blue: "#4eb3ff",
  green: "#b8ff57",
  text: "#f5f7fa",
  muted: "#a7b0ba",
  dim: "#4e5f6d"
};

function preload() {
  data = loadJSON("data/chen_long_network_data.json");
}

function setup() {
  const canvas = createCanvas(1280, 860);
  const holder = document.getElementById("hwk5-canvas-container") || document.getElementById("p5-holder");
  if (holder) canvas.parent(holder);
  textFont("Arial");
  selectedOpponent = data.opponents[0];
  layoutNodes();
  for (let i = 0; i < 90; i++) {
    particles.push({x: random(width), y: random(height), a: random(15, 65), s: random(0.3, 1.3)});
  }
}

function layoutNodes() {
  chenNode = { id: "chen_long", name: "Chen Long", x: 360, y: 365, r: 88 };
  opponentNodes = [];
  const cx = chenNode.x;
  const cy = chenNode.y;
  const opps = data.opponents;
  let angles;
  if (opps.length === 1) angles = [0];
  else if (opps.length === 2) angles = [-34, 34];
  else angles = opps.map((_, i) => map(i, 0, opps.length - 1, -70, 70));
  const maxR = max(opps.map(o => o.observedRallies));
  const minR = min(opps.map(o => o.observedRallies));
  for (let i = 0; i < opps.length; i++) {
    let angle = radians(angles[i]);
    let radius = 290;
    let size = map(opps[i].observedRallies, minR, maxR, 62, 82);
    if (minR === maxR) size = 72;
    opponentNodes.push({
      ...opps[i],
      x: cx + cos(angle) * radius,
      y: cy + sin(angle) * radius,
      r: size,
      color: i % 2 === 0 ? C.cyan : C.red
    });
  }
}

function draw() {
  background(C.bg);
  drawBackground();
  drawHeader();
  drawNetworkCard();
  drawDetailPanel();
  drawBottomPanels();
  drawFooterNote();
}

function drawBackground() {
  noStroke();
  for (const p of particles) {
    fill(255, 255, 255, p.a);
    circle(p.x, p.y, p.s);
  }
  // soft radial glow
  for (let r = 500; r > 0; r -= 12) {
    let a = map(r, 0, 500, 0, 12);
    fill(30, 130, 190, a);
    ellipse(365, 385, r * 1.7, r);
  }
}

function drawHeader() {
  fill(C.text); noStroke(); textAlign(LEFT, TOP);
  textSize(30); textStyle(BOLD);
  text("Chen Long's Matchup Network", 34, 24);
  fill(C.chen); textSize(46);
  text("Opponent-by-Opponent Pressure Patterns", 34, 58);
  fill(C.muted); textStyle(NORMAL); textSize(16);
  text(data.subtitle, 36, 116);

  drawPill(36, 148, 620, 42, "HOW TO READ", "Click an opponent: that node and edge stay bright, other opponents fade, and the right panel updates.");
}

function drawPill(x, y, w, h, label, body) {
  stroke(255,255,255,28); fill(255,255,255,8); rect(x, y, w, h, 10);
  noStroke(); fill(C.green); textSize(15); textStyle(BOLD); textAlign(LEFT, CENTER); text(label, x+18, y+h/2);
  fill(C.text); textStyle(NORMAL); text(body, x+142, y+h/2);
}

function drawCard(x, y, w, h, title) {
  stroke(255,255,255,34); strokeWeight(1); fill(C.card); rect(x, y, w, h, 16);
  noStroke(); fill(C.text); textSize(17); textStyle(BOLD); textAlign(LEFT, TOP); text(title, x+20, y+18);
}

function drawNetworkCard() {
  drawCard(34, 204, 735, 452, "Interaction Network");
  drawEdges();
  drawChenNode();
  drawOpponentNodes();
  drawLegendMini(548, 224);
  fill(C.muted); textSize(13); textStyle(NORMAL); textAlign(LEFT, TOP);
  text("Edge width = observed rallies. Selected edge label = Chen Long's top scoring pattern.", 60, 620);
}

function drawEdges() {
  const maxR = max(opponentNodes.map(o => o.observedRallies));
  const minR = min(opponentNodes.map(o => o.observedRallies));
  for (const o of opponentNodes) {
    const isSel = selectedOpponent && selectedOpponent.id === o.id;
    const hasSelection = !!selectedOpponent;
    const isDim = hasSelection && !isSel;
    const sw = minR === maxR ? 5 : map(o.observedRallies, minR, maxR, 3, 9);
    strokeWeight(isSel ? sw + 3 : sw);
    const col = color(isSel ? C.chen : o.color);
    col.setAlpha(isDim ? 40 : isSel ? 230 : 120);
    stroke(col);
    line(chenNode.x, chenNode.y, o.x, o.y);
    if (isSel) {
      drawEdgeGlow(o);
      drawEdgeLabel(o);
    }
  }
}

function drawEdgeGlow(o) {
  for (let i = 14; i >= 1; i -= 3) {
    stroke(246, 200, 67, 10); strokeWeight(i);
    line(chenNode.x, chenNode.y, o.x, o.y);
  }
}

function drawEdgeLabel(o) {
  const mx = (chenNode.x + o.x)/2;
  const my = (chenNode.y + o.y)/2 - 32;
  const txt1 = "Chen top score";
  const txt2 = `${o.topChenReason.label} ${o.topChenReason.pct}%`;
  noStroke(); fill(6, 19, 31, 235); rect(mx-88, my-26, 176, 56, 12);
  stroke(C.chen); noFill(); rect(mx-88, my-26, 176, 56, 12);
  noStroke(); textAlign(CENTER, CENTER); textSize(12); fill(C.muted); text(txt1, mx, my-7);
  textSize(15); fill(C.chen); textStyle(BOLD); text(txt2, mx, my+13); textStyle(NORMAL);
}

function drawChenNode() {
  glowCircle(chenNode.x, chenNode.y, chenNode.r, C.chen, 30);
  stroke(C.chen); strokeWeight(4); fill("#172033"); circle(chenNode.x, chenNode.y, chenNode.r*2);
  noStroke(); fill(C.chen); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(38); text("CL", chenNode.x, chenNode.y-8);
  textSize(16); fill(C.text); text("Chen Long", chenNode.x, chenNode.y+70);
  textStyle(NORMAL); fill(C.muted); textSize(12); text(`${data.chen.matches} matches / ${data.chen.games} games`, chenNode.x, chenNode.y+90);
}

function drawOpponentNodes() {
  hoveredOpponent = null;
  for (const o of opponentNodes) {
    if (dist(mouseX, mouseY, o.x, o.y) < o.r) hoveredOpponent = o;
  }
  for (const o of opponentNodes) {
    const isSel = selectedOpponent && selectedOpponent.id === o.id;
    const isHover = hoveredOpponent && hoveredOpponent.id === o.id;
    const isDim = selectedOpponent && !isSel;
    const r = o.r + (isHover ? 6 : 0);
    const alpha = isDim ? 70 : 255;
    glowCircle(o.x, o.y, r, isSel ? C.chen : o.color, isSel ? 26 : 12, isDim ? 0.25 : 1);
    stroke(isSel ? C.chen : o.color); strokeWeight(isSel ? 4 : 2);
    fillAlpha(C.card2, isDim ? 70 : 235); circle(o.x, o.y, r*2);
    noStroke(); fillAlpha(o.color, alpha); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(22); text(initials(o.name), o.x, o.y-10);
    fillAlpha(C.text, alpha); textSize(14); text(wrapName(o.name), o.x, o.y+r+18);
    fillAlpha(C.muted, alpha); textStyle(NORMAL); textSize(12); text(`${o.chenGamesWon}-${o.opponentGamesWon} games`, o.x, o.y+r+38);
  }
}

function fillAlpha(hex, alpha) {
  const c = color(hex); c.setAlpha(alpha); fill(c);
}

function glowCircle(x, y, r, hex, strength, mult=1) {
  const c = color(hex);
  noStroke();
  for (let k = 4; k >= 1; k--) {
    c.setAlpha(strength * k * mult);
    fill(c); circle(x, y, r*2 + k*18);
  }
}

function drawLegendMini(x, y) {
  textAlign(LEFT, TOP); textSize(12); fill(C.muted); textStyle(NORMAL);
  stroke(C.chen); strokeWeight(6); line(x, y+10, x+34, y+10); noStroke(); text("selected matchup", x+45, y+3);
  stroke(C.line); strokeWeight(3); line(x, y+34, x+34, y+34); noStroke(); text("unselected relationship", x+45, y+27);
}

function initials(name) {
  return name.split(' ').map(s => s[0]).join('').slice(0,3).toUpperCase();
}
function wrapName(name) {
  if (name.length <= 14) return name;
  const parts = name.split(' ');
  return parts.slice(0,-1).join(' ') + "\n" + parts[parts.length-1];
}

function drawDetailPanel() {
  const x = 800, y = 150, w = 446, h = 506;
  drawCard(x, y, w, h, "Selected Opponent Detail");
  const o = selectedOpponent;
  if (!o) {
    noStroke(); fill(C.muted); textSize(18); textAlign(LEFT, TOP);
    text("Click an opponent node to reveal the matchup story.", x+30, y+75, w-60);
    return;
  }
  noStroke(); fill(C.text); textSize(28); textStyle(BOLD); textAlign(LEFT, TOP);
  text(`Chen Long vs ${o.name}`, x+28, y+58);
  fill(C.muted); textSize(15); textStyle(NORMAL);
  text(`${o.matches} match(es), ${o.games} games | Chen games won: ${o.chenGamesWon}, opponent games won: ${o.opponentGamesWon}`, x+30, y+96, w-60);
  fill(C.chen); textSize(15); textStyle(BOLD); text(o.narrative, x+30, y+126, w-60);
  drawMetricGrid(x+28, y+184, o);
  drawMatchScoreCards(x+28, y+332, w-56, o);
}

function drawMetricGrid(x, y, o) {
  const cards = [
    ["Observed rallies", o.observedRallies],
    ["Total shots", o.totalShots],
    ["Avg rally length", o.avgRallyLength],
    ["Chen point win rate", o.chenPointWinRate + "%"],
    ["Missing rally rows", o.missingRallyRows],
    ["Inferred winners", o.inferredWinners]
  ];
  const cw = 126, ch = 58, gap = 14;
  for (let i=0; i<cards.length; i++) {
    const xx = x + (i%3)*(cw+gap), yy = y + floor(i/3)*(ch+gap);
    stroke(255,255,255,32); fill(255,255,255,8); rect(xx, yy, cw, ch, 10);
    noStroke(); fill(C.muted); textSize(12); textStyle(NORMAL); textAlign(LEFT, TOP); text(cards[i][0], xx+12, yy+10);
    fill(C.text); textSize(20); textStyle(BOLD); text(cards[i][1], xx+12, yy+29);
  }
}

function drawMatchScoreCards(x, y, w, o) {
  fill(C.text); textSize(16); textStyle(BOLD); textAlign(LEFT, TOP); text("Scorelines", x, y-26);
  const mh = 66; let yy = y;
  for (const m of o.matchesDetail) {
    stroke(255,255,255,30); fill(255,255,255,7); rect(x, yy, w, mh, 10);
    noStroke(); fill(C.text); textSize(13); textStyle(BOLD); text(m.match_label, x+14, yy+10);
    fill(C.muted); textStyle(NORMAL); text(`${m.scoreline}  |  Games: ${m.chen_games_won}-${m.opponent_games_won}`, x+14, yy+33);
    fill(m.chen_match_won ? C.green : C.red); textStyle(BOLD); text(m.chen_match_won ? "Chen won" : "Chen lost", x+w-94, yy+23);
    yy += mh + 10;
  }
}

function drawBottomPanels() {
  drawScorePanel(34, 682, 560, 150);
  drawShotPanel(620, 682, 305, 150);
  drawReasonPanel(946, 682, 300, 150);
}

function drawScorePanel(x, y, w, h) {
  drawCard(x, y, w, h, "Scoreline by Game");
  const o = selectedOpponent;
  if (!o) return;
  let games = [];
  for (const m of o.matchesDetail) for (const g of m.games) games.push({...g, match_label: m.match_label});
  const maxBar = max(games.map(g => max(+g.chen_score, +g.opponent_score)));
  let yy = y+52;
  for (const g of games.slice(0, 5)) {
    const chenW = map(+g.chen_score, 0, maxBar, 0, w-235);
    const oppW = map(+g.opponent_score, 0, maxBar, 0, w-235);
    noStroke(); fill(C.muted); textSize(11); textAlign(LEFT, CENTER); text(`${g.match_label} G${g.game_id}`, x+20, yy+8);
    fill(C.chen); rect(x+170, yy, chenW, 8, 4);
    fill(C.blue); rect(x+170, yy+13, oppW, 8, 4);
    fill(C.text); textSize(11); text(`${g.chen_score}-${g.opponent_score}`, x+w-50, yy+10);
    yy += 25;
  }
  drawTinyLegend(x+20, y+h-25, [[C.chen,"Chen"],[C.blue,"Opponent"]]);
}

function drawTinyLegend(x, y, items) {
  let xx=x;
  for (const [col, lab] of items) {
    noStroke(); fill(col); rect(xx, y, 10, 10, 2);
    fill(C.muted); textSize(12); textAlign(LEFT, CENTER); text(lab, xx+15, y+5); xx += 92;
  }
}

function drawShotPanel(x, y, w, h) {
  drawCard(x, y, w, h, "Shot Type Contrast");
  const o = selectedOpponent; if (!o) return;
  const rows = o.shotTypes.slice(0, 5);
  const maxCount = max(rows.map(r => max(r.chen, r.opponent)));
  let yy = y+47;
  for (const r of rows) {
    fill(C.muted); noStroke(); textSize(11); textAlign(RIGHT, CENTER); text(r.type, x+76, yy+4);
    fill(C.chen); rect(x+86, yy-4, map(r.chen,0,maxCount,0,80), 6, 4);
    fill(C.blue); rect(x+86, yy+5, map(r.opponent,0,maxCount,0,80), 6, 4);
    fill(C.muted); textAlign(LEFT, CENTER); text(`${r.chen}/${r.opponent}`, x+178, yy+2);
    yy += 18;
  }
  drawTinyLegend(x+90, y+h-24, [[C.chen,"Chen"],[C.blue,"Opp."]]);
}

function drawReasonPanel(x, y, w, h) {
  drawCard(x, y, w, h, "Why Points Were Won");
  const o = selectedOpponent; if (!o) return;
  const topChen = o.chenScoringReasons.slice(0,3);
  const topOpp = o.opponentScoringReasons.slice(0,2);
  let yy = y+52;
  fill(C.chen); textSize(12); textStyle(BOLD); textAlign(LEFT, CENTER); text("Chen scoring", x+20, yy-18);
  drawReasonRows(x+20, yy, w-40, topChen, C.chen);
  yy += 66;
  fill(C.blue); text("Opponent scoring", x+20, yy-8);
  drawReasonRows(x+20, yy+10, w-40, topOpp, C.blue);
  textStyle(NORMAL);
}

function drawReasonRows(x, y, w, rows, col) {
  let maxPct = max(rows.map(r => r.pct));
  if (!isFinite(maxPct)) maxPct = 1;
  for (let i=0; i<rows.length; i++) {
    const r = rows[i];
    const yy = y + i*19;
    noStroke(); fill(C.muted); textSize(11); textStyle(NORMAL); textAlign(LEFT, CENTER); text(r.label, x, yy);
    fill(col); rect(x+w-86, yy-5, map(r.pct,0,maxPct,0,55), 7, 4);
    fill(C.text); textAlign(RIGHT, CENTER); text(`${r.pct}%`, x+w, yy);
  }
}

function drawFooterNote() {
  noStroke(); fill(C.muted); textSize(11); textAlign(LEFT, BOTTOM);
  text("Dataset: " + data.datasetNote + "  •  Data cleaning script included for replicability.", 34, 852);
}

function mousePressed() {
  let clicked = false;
  for (const o of opponentNodes) {
    if (dist(mouseX, mouseY, o.x, o.y) < o.r + 8) {
      selectedOpponent = data.opponents.find(d => d.id === o.id);
      clicked = true;
      break;
    }
  }
  if (!clicked && mouseX < 770 && mouseY > 204 && mouseY < 656) {
    selectedOpponent = null;
  }
}

function windowResized() {
  // Keep fixed canvas for a stable homework screenshot / social-card crop.
}
'''
(OUT/'sketch.js').write_text(sketch, encoding='utf-8')
# Duplicate with homework name for easy integration
(OUT/'sketch-hwk5.js').write_text(sketch.replace('canvas.parent(holder);', 'canvas.parent(holder);'), encoding='utf-8')

html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HWK5 Chen Long Matchup Network</title>
  <style>
    body { margin: 0; background: #06131f; color: #f5f7fa; font-family: Arial, sans-serif; }
    #p5-holder { width: 1280px; max-width: 100%; margin: 0 auto; }
    canvas { display: block; max-width: 100%; height: auto !important; }
  </style>
</head>
<body>
  <div id="p5-holder"></div>
  <script src="https://cdn.jsdelivr.net/npm/p5@1.11.10/lib/p5.js"></script>
  <script src="sketch.js"></script>
</body>
</html>
'''
(OUT/'index.html').write_text(html, encoding='utf-8')

readme = '''# HWK5 Chen Long Matchup Network

This project implements a p5.js hub-and-detail narrative visualization.

## Story
Chen Long is placed at the center. Opponent nodes around him act as entry points. When an opponent is selected, the selected matchup is highlighted, other opponents fade, the edge shows Chen Long's top scoring pattern, and the right-side panel shows the relevant match data.

## Files
- `index.html`: standalone local preview page.
- `sketch.js`: p5.js visualization.
- `sketch-hwk5.js`: same sketch, ready to copy into an existing class repo `sketches/` folder.
- `data/chen_long_network_data.json`: processed data used by p5.js.
- `data/all_shots_organized.csv`: shot-level table with normalized player names and cleaned shot types.
- `data/rally_summary.csv`: one row per rally.
- `data/game_summary.csv`: one row per game.
- `data/match_summary.csv`: one row per match.
- `data/opponent_summary.csv`: one row per opponent.
- `raw/`: original CSV files.
- `preprocess_chen_long_network.py`: replicable data processing script.

## Local run
Open this folder in VS Code, right-click `index.html`, and choose **Open with Live Server**.

## Integration into class repo
1. Copy `sketch-hwk5.js` into your repo's `sketches/` folder.
2. Copy the `data/` folder into your repo.
3. In the HWK #5 tab only, add `<div id="hwk5-canvas-container"></div>`.
4. Add these script tags after p5.js:
   `<script src="sketches/sketch-hwk5.js"></script>`
'''
(OUT/'README.md').write_text(readme, encoding='utf-8')

# Create a simple processed data preview JSON summary text too
summary = {
    'games_processed': len(game_rows),
    'matches_processed': len(match_summaries),
    'opponents': [{
        'name': o['name'], 'matches': o['matches'], 'games': o['games'], 'chen_games_record': f"{o['chenGamesWon']}-{o['opponentGamesWon']}", 'observed_rallies': o['observedRallies'], 'total_shots': o['totalShots'], 'top_chen_reason': o['topChenReason'], 'top_opponent_reason': o['topOpponentReason']
    } for o in opponents]
}
(OUT/'processing_summary.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding='utf-8')

# Zip project
zip_path = ROOT / 'chen_long_hwk5_network_p5js.zip'
if zip_path.exists(): zip_path.unlink()
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in OUT.rglob('*'):
        z.write(p, p.relative_to(OUT.parent))
print('WROTE', zip_path)
print(json.dumps(summary, indent=2, ensure_ascii=False))
