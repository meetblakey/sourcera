import re
import json
from collections import defaultdict, Counter

LEDGER = "/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/DEFECT_LEDGER.md"

with open(LEDGER, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Known phase values (build from observation): phase begins with "Phase" or "Audit" or specific patterns
# Strategy: for canonical rows with > 12 parts (extra pipes embedded), we need to find the canonical column 9 (phase).
# The phase column always starts with "Phase " or is a recognized pattern.
# We can re-assemble by walking from the END:
#   parts[-1] = links
#   parts[-2] = status (one of open, remediated, etc.)
#   parts[-3] = phase
#   parts[-4] = owner
# And from the START:
#   parts[0] = id
#   parts[1] = severity
#   parts[2] = class
#   parts[3] = location
# The middle (summary, evidence, convention, recommendation) is where pipes leak.

STATUS_VALUES = {"open", "proposed_extension", "wont_fix", "remediated", "superseded", "partially_remediated"}

canonical_rows = []
supplementary_transitions = {}

for idx, line in enumerate(lines, 1):
    if not line.startswith("| D-"):
        continue
    raw = line.strip()
    if raw.endswith("|"):
        raw = raw[:-1]
    if raw.startswith("|"):
        raw = raw[1:]
    parts = [p.strip() for p in raw.split("|")]
    
    # Check if this looks like a canonical row: severity in P0/P1/P2/P3 at position 1
    severity = parts[1] if len(parts) > 1 else ""
    if severity.upper() not in ("P0", "P1", "P2", "P3"):
        # Not canonical, check for supplementary transitions
        defect_id = parts[0]
        full_text = line.lower()
        if "→ remediated" in full_text or "→remediated" in full_text or "-> remediated" in full_text:
            supplementary_transitions[defect_id] = "remediated"
        elif "→ superseded" in full_text or "→superseded" in full_text:
            supplementary_transitions[defect_id] = "superseded"
        elif "→ wont_fix" in full_text:
            supplementary_transitions[defect_id] = "wont_fix"
        else:
            for p in parts[1:]:
                pl = p.strip().lower()
                if pl == "remediated" or "→ remediated" in pl:
                    supplementary_transitions[defect_id] = "remediated"
                    break
                if pl == "superseded" or "→ superseded" in pl:
                    supplementary_transitions[defect_id] = "superseded"
                    break
        continue
    
    if len(parts) < 12:
        # Malformed canonical row — skip but track
        continue
    
    # Identify status column from the right: find the rightmost cell that's a status value
    # Walk from -2 inward
    status_idx = None
    for i in range(len(parts)-1, max(len(parts)-6, 0)-1, -1):
        if parts[i].lower() in STATUS_VALUES or "remediat" in parts[i].lower() or "supersed" in parts[i].lower():
            status_idx = i
            break
    if status_idx is None:
        # Fallback to position 10
        status_idx = 10 if len(parts) > 10 else len(parts)-2
    
    # Standard layout:
    # 0=id, 1=severity, 2=class, 3=location, 4=summary, 5=evidence, 6=convention, 7=recommendation, 8=owner, 9=phase, 10=status, 11=links
    # When pipes leak, the leak typically happens in summary/evidence/convention/recommendation (cols 4-7)
    # status_idx tells us where status sits
    # links = parts[status_idx+1:] joined
    # phase = parts[status_idx-1]
    # owner = parts[status_idx-2]
    # recommendation = parts[7..status_idx-3] joined
    # We'll trust positions 0-3 (id, severity, class, location).
    # We'll trust the last 3 columns: phase, status, links.
    
    defect_id = parts[0]
    cls = parts[2]
    location = parts[3]
    status = parts[status_idx]
    phase = parts[status_idx-1] if status_idx >= 1 else ""
    owner = parts[status_idx-2] if status_idx >= 2 else ""
    links = " | ".join(parts[status_idx+1:]) if status_idx+1 < len(parts) else ""
    
    # The middle bits — summary is parts[4], rest is glob
    summary = parts[4] if len(parts) > 4 else ""
    # If summary got pipes-leaked, we have parts[4..status_idx-3] for summary+evidence+convention+recommendation.
    # For our purposes (clustering), summary on parts[4] is usually good enough.
    
    recommendation = ""
    if status_idx - 3 >= 7:
        recommendation = parts[status_idx-3]
    elif len(parts) > 7:
        recommendation = parts[7]
    
    canonical_rows.append({
        "id": defect_id,
        "severity": severity.upper(),
        "class": cls,
        "location": location,
        "summary": summary,
        "recommendation": recommendation,
        "owner": owner,
        "phase": phase,
        "status": status,
        "links": links,
        "line": idx,
    })

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

# Verify the suspect rows are fixed
suspect = [r for r in p2_open+p3_open if r["phase"].lower() in ("engineering", "design", "ops", "pricing", "security", "documentation", "legal", "analytics", "audit")]
print(f"\nRemaining suspect rows: {len(suspect)}")
for r in suspect[:5]:
    print(f"  {r['id']} | phase='{r['phase']}' | status='{r['status']}'")

with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/p2_open.json", "w") as f:
    json.dump(p2_open, f)
with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/p3_open.json", "w") as f:
    json.dump(p3_open, f)
with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/supp_trans.json", "w") as f:
    json.dump(supplementary_transitions, f)

print(f"\n--- Phase distribution P2 (top 30) ---")
phase_counter = Counter(r["phase"] for r in p2_open)
for ph, cnt in sorted(phase_counter.items(), key=lambda x: -x[1])[:30]:
    print(f"  {ph}: {cnt}")

print(f"\n--- Class distribution P2 ---")
class_counter = Counter(r["class"] for r in p2_open)
for cls, cnt in sorted(class_counter.items(), key=lambda x: -x[1]):
    print(f"  {cls}: {cnt}")

print(f"\n--- Phase distribution P3 (top 30) ---")
phase_counter3 = Counter(r["phase"] for r in p3_open)
for ph, cnt in sorted(phase_counter3.items(), key=lambda x: -x[1])[:30]:
    print(f"  {ph}: {cnt}")

print(f"\n--- Class distribution P3 ---")
class_counter3 = Counter(r["class"] for r in p3_open)
for cls, cnt in sorted(class_counter3.items(), key=lambda x: -x[1]):
    print(f"  {cls}: {cnt}")
