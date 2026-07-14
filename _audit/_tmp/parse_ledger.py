import re
import os
import json
from collections import defaultdict, Counter

LEDGER = "/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/DEFECT_LEDGER.md"

with open(LEDGER, "r", encoding="utf-8") as f:
    lines = f.readlines()

canonical_rows = []
supplementary_transitions = {}

for idx, line in enumerate(lines, 1):
    if not line.startswith("| D-"):
        continue
    parts = [p.strip() for p in line.strip().strip("|").split("|")]
    if len(parts) >= 12:
        defect_id = parts[0]
        canonical_rows.append({
            "id": defect_id,
            "severity": parts[1],
            "class": parts[2],
            "location": parts[3],
            "summary": parts[4],
            "evidence": parts[5],
            "convention": parts[6],
            "recommendation": parts[7],
            "owner": parts[8],
            "phase": parts[9],
            "status": parts[10],
            "links": parts[11] if len(parts) > 11 else "",
            "line": idx,
        })
    else:
        defect_id = parts[0]
        full_text = line.lower()
        if "→ remediated" in full_text or "→remediated" in full_text or "-> remediated" in full_text:
            supplementary_transitions[defect_id] = "remediated"
        elif "→ superseded" in full_text or "→superseded" in full_text or "-> superseded" in full_text:
            supplementary_transitions[defect_id] = "superseded"
        elif "→ wont_fix" in full_text:
            supplementary_transitions[defect_id] = "wont_fix"
        else:
            for p in parts[1:]:
                pl = p.strip().lower()
                if pl == "remediated" or pl.startswith("→ remediated"):
                    supplementary_transitions[defect_id] = "remediated"
                    break
                if pl == "superseded" or pl.startswith("→ superseded"):
                    supplementary_transitions[defect_id] = "superseded"
                    break

def is_open(row):
    status = row["status"].lower()
    if "remediat" in status or "superseded" in status or "wont_fix" in status or "partially" in status:
        return False
    if row["id"] in supplementary_transitions:
        return False
    return True

p2_open = [r for r in canonical_rows if r["severity"].upper() == "P2" and is_open(r)]
p3_open = [r for r in canonical_rows if r["severity"].upper() == "P3" and is_open(r)]

print(f"Total canonical rows parsed: {len(canonical_rows)}")
print(f"Supplementary transitions found: {len(supplementary_transitions)}")
print(f"P2 open: {len(p2_open)}")
print(f"P3 open: {len(p3_open)}")

sev_counter = Counter(r["severity"].upper() for r in canonical_rows)
print(f"Severity distribution: {dict(sev_counter)}")

with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/p2_open.json", "w") as f:
    json.dump(p2_open, f)
with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/p3_open.json", "w") as f:
    json.dump(p3_open, f)
with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/supp_trans.json", "w") as f:
    json.dump(supplementary_transitions, f)

# Show some sample data
print("\n--- Phase distribution of P2 open ---")
phase_counter = Counter(r["phase"] for r in p2_open)
for ph, cnt in sorted(phase_counter.items(), key=lambda x: -x[1])[:30]:
    print(f"  {ph}: {cnt}")

print("\n--- Class distribution of P2 open ---")
class_counter = Counter(r["class"] for r in p2_open)
for cls, cnt in sorted(class_counter.items(), key=lambda x: -x[1])[:30]:
    print(f"  {cls}: {cnt}")

print("\n--- Phase distribution of P3 open ---")
phase_counter3 = Counter(r["phase"] for r in p3_open)
for ph, cnt in sorted(phase_counter3.items(), key=lambda x: -x[1])[:30]:
    print(f"  {ph}: {cnt}")

print("\n--- Class distribution of P3 open ---")
class_counter3 = Counter(r["class"] for r in p3_open)
for cls, cnt in sorted(class_counter3.items(), key=lambda x: -x[1])[:30]:
    print(f"  {cls}: {cnt}")
