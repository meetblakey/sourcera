import re
import json
from collections import defaultdict, Counter

LEDGER = "/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/DEFECT_LEDGER.md"

with open(LEDGER, "r", encoding="utf-8") as f:
    lines = f.readlines()

STATUS_VALUES = {"open", "proposed_extension", "wont_fix", "remediated", "superseded", "partially_remediated"}

canonical_rows = []
supplementary_transitions = {}

# Strategy: 
# - If row has >= 12 parts, it's canonical
# - Otherwise it's supplementary; scan for transition keywords

for idx, line in enumerate(lines, 1):
    if not line.startswith("| D-"):
        continue
    raw = line.strip()
    if raw.endswith("|"):
        raw = raw[:-1]
    if raw.startswith("|"):
        raw = raw[1:]
    parts = [p.strip() for p in raw.split("|")]
    
    if len(parts) >= 12:
        # Canonical row
        severity = parts[1]
        if severity.upper() not in ("P0", "P1", "P2", "P3"):
            # malformed? Treat as supplementary
            pass
        else:
            # Identify status column from the right
            status_idx = None
            for i in range(len(parts)-1, max(len(parts)-6, 0)-1, -1):
                pl = parts[i].lower()
                if pl in STATUS_VALUES or "remediat" in pl or "supersed" in pl:
                    status_idx = i
                    break
            if status_idx is None:
                status_idx = 10 if len(parts) > 10 else len(parts)-2
            
            defect_id = parts[0]
            canonical_rows.append({
                "id": defect_id,
                "severity": severity.upper(),
                "class": parts[2],
                "location": parts[3],
                "summary": parts[4] if len(parts) > 4 else "",
                "recommendation": parts[status_idx-3] if status_idx-3 >= 7 else (parts[7] if len(parts) > 7 else ""),
                "owner": parts[status_idx-2] if status_idx >= 2 else "",
                "phase": parts[status_idx-1] if status_idx >= 1 else "",
                "status": parts[status_idx],
                "links": " | ".join(parts[status_idx+1:]) if status_idx+1 < len(parts) else "",
                "line": idx,
            })
            continue
    
    # Supplementary row (fewer than 12 parts)
    defect_id = parts[0]
    full_text = line.lower()
    detected = None
    if "→ remediated" in full_text or "→remediated" in full_text or "-> remediated" in full_text:
        detected = "remediated"
    elif "→ superseded" in full_text or "→superseded" in full_text or "-> superseded" in full_text:
        detected = "superseded"
    elif "→ wont_fix" in full_text:
        detected = "wont_fix"
    else:
        for p in parts[1:]:
            pl = p.strip().lower()
            if pl == "remediated" or pl.startswith("remediated ") or "→ remediated" in pl:
                detected = "remediated"
                break
            if pl == "superseded" or pl.startswith("superseded ") or "→ superseded" in pl:
                detected = "superseded"
                break
    if detected:
        supplementary_transitions[defect_id] = detected

def is_open(row):
    status = row["status"].lower()
    if "remediat" in status or "superseded" in status or "wont_fix" in status or "partially" in status:
        return False
    if row["id"] in supplementary_transitions:
        return False
    return True

p2_open = [r for r in canonical_rows if r["severity"] == "P2" and is_open(r)]
p3_open = [r for r in canonical_rows if r["severity"] == "P3" and is_open(r)]

print(f"Total canonical rows: {len(canonical_rows)}")
print(f"Supplementary transitions: {len(supplementary_transitions)}")
print(f"P2 open: {len(p2_open)}")
print(f"P3 open: {len(p3_open)}")

sev_counter = Counter(r["severity"] for r in canonical_rows)
print(f"Severity distribution: {dict(sev_counter)}")

# Class distribution among supplementary transitions
remed_count = sum(1 for v in supplementary_transitions.values() if v == "remediated")
super_count = sum(1 for v in supplementary_transitions.values() if v == "superseded")
print(f"Remediated transitions: {remed_count}")
print(f"Superseded transitions: {super_count}")

with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/p2_open.json", "w") as f:
    json.dump(p2_open, f)
with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/p3_open.json", "w") as f:
    json.dump(p3_open, f)
with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/supp_trans.json", "w") as f:
    json.dump(supplementary_transitions, f)

# Summary
phase_counter = Counter(r["phase"] for r in p2_open)
print(f"\n--- P2 open phases (count: {len(phase_counter)}) ---")
print(f"Total P2 phases: {len(phase_counter)}")
class_counter = Counter(r["class"] for r in p2_open)
print(f"P2 classes: {len(class_counter)}")
phase_counter3 = Counter(r["phase"] for r in p3_open)
class_counter3 = Counter(r["class"] for r in p3_open)
print(f"P3 phases: {len(phase_counter3)}, classes: {len(class_counter3)}")
