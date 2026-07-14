import json
from collections import Counter

with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/p2_open.json") as f:
    p2 = json.load(f)
with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/p3_open.json") as f:
    p3 = json.load(f)

# Check rows where phase looks like an owner
suspect = [r for r in p2+p3 if r["phase"].lower() in ("engineering", "design", "ops", "pricing", "security", "documentation", "legal", "analytics", "audit")]
print(f"Suspect rows (phase looks like owner): {len(suspect)}")
for r in suspect[:10]:
    print(f"  {r['id']} | phase='{r['phase']}' | owner='{r['owner']}' | status='{r['status']}'")
    # Print all parts
    print(f"    summary={r['summary'][:80]}")
    print(f"    class={r['class']}")

# Check what `Authoring Convention #10.` rows look like
ac_rows = [r for r in p2+p3 if "Authoring Convention" in r["phase"]]
print(f"\nAuthoring Convention rows: {len(ac_rows)}")
for r in ac_rows[:5]:
    print(f"  {r['id']} | phase='{r['phase']}'")
