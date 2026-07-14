import re
import json
from collections import defaultdict, Counter

LEDGER = "/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/DEFECT_LEDGER.md"

with open(LEDGER, "r", encoding="utf-8") as f:
    raw_text = f.read()
    lines = raw_text.splitlines(keepends=True)

STATUS_VALUES = {"open", "proposed_extension", "wont_fix", "remediated", "superseded", "partially_remediated"}

canonical_rows = []
supplementary_transitions = {}

DEFECT_ID_PATTERN = re.compile(r"D-[A-Za-z0-9.\-_]+-\d+")

# Detect canonical defect table region: starts at line 248 (header line 247), continues until next major heading
# But canonical rows are interleaved with supplementary tables. We rely on column count >= 12.

for idx, line in enumerate(lines, 1):
    if not line.startswith("| D-"):
        continue
    raw = line.strip()
    if raw.endswith("|"):
        raw = raw[:-1]
    if raw.startswith("|"):
        raw = raw[1:]
    parts = [p.strip() for p in raw.split("|")]
    
    if len(parts) >= 12 and parts[1].upper() in ("P0", "P1", "P2", "P3"):
        severity = parts[1]
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
    
    # Supplementary table row
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
            if pl == "remediated" or pl.startswith("remediated "):
                detected = "remediated"
                break
            if pl == "superseded" or pl.startswith("superseded "):
                detected = "superseded"
                break
    if detected:
        supplementary_transitions[defect_id] = detected

# ALSO walk narrative bullets — sections like "Remediated (31 rows — full closure in Master Spec):" followed by
# bulleted defect_id lists.
# Strategy: find lines containing "remediated" in headings (within bold/italic) and capture defect_ids in 
# the lines that follow until next blank-line or heading.

# Look for sections that explicitly list remediated defect_ids in narrative form.
# Pattern: a line containing "**Remediated*" or "Remediated (" followed by bullet/lines with D-XXX patterns.

REMED_HDR_PATTERNS = [
    re.compile(r"\*\*Remediated[^*]*\*\*", re.IGNORECASE),
    re.compile(r"Remediated \(\d+ rows?", re.IGNORECASE),
    re.compile(r"closed (in this pass|inside this pass)", re.IGNORECASE),
]
SUPERSEDED_HDR_PATTERNS = [
    re.compile(r"\*\*Superseded[^*]*\*\*", re.IGNORECASE),
]
# Lines starting with "Partially Remediated" indicate something different — we treat those defects
# as still tracked (NOT fully remediated). Exclude from auto-remediated capture.

def harvest_defect_ids(text):
    return DEFECT_ID_PATTERN.findall(text)

i = 0
while i < len(lines):
    line = lines[i]
    matched_remed = any(p.search(line) for p in REMED_HDR_PATTERNS)
    matched_super = any(p.search(line) for p in SUPERSEDED_HDR_PATTERNS)
    # Skip "Partially Remediated" headers - those are NOT full remediations
    if "partially remediated" in line.lower() or "partially_remediated" in line.lower():
        matched_remed = False
    
    if matched_remed or matched_super:
        # Collect defect_ids from the same line and subsequent narrative lines until next blank or heading
        target = "remediated" if matched_remed else "superseded"
        # Same line
        for did in harvest_defect_ids(line):
            if did not in supplementary_transitions:
                supplementary_transitions[did] = target
        # Following lines
        j = i + 1
        consecutive_blank = 0
        while j < len(lines) and consecutive_blank < 1:
            l2 = lines[j]
            stripped = l2.strip()
            if not stripped:
                consecutive_blank += 1
                j += 1
                continue
            # Stop on new heading
            if stripped.startswith("#") or stripped.startswith("**") and stripped.endswith("**") and len(stripped) > 4:
                break
            # Also stop on next "Partially Remediated" section etc.
            if "partially remediated" in stripped.lower():
                break
            # Capture defect IDs
            for did in harvest_defect_ids(l2):
                if did not in supplementary_transitions:
                    supplementary_transitions[did] = target
            j += 1
        i = j
        continue
    i += 1

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
print(f"Supplementary transitions detected: {len(supplementary_transitions)}")
print(f"P2 open: {len(p2_open)}")
print(f"P3 open: {len(p3_open)}")

with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/p2_open.json", "w") as f:
    json.dump(p2_open, f)
with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/p3_open.json", "w") as f:
    json.dump(p3_open, f)
with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/supp_trans.json", "w") as f:
    json.dump(supplementary_transitions, f)

phase_counter = Counter(r["phase"] for r in p2_open)
class_counter = Counter(r["class"] for r in p2_open)
phase_counter3 = Counter(r["phase"] for r in p3_open)
class_counter3 = Counter(r["class"] for r in p3_open)
print(f"\nP2 unique phases: {len(phase_counter)}; classes: {len(class_counter)}")
print(f"P3 unique phases: {len(phase_counter3)}; classes: {len(class_counter3)}")

# Spot-check D-51-001 (should now be remediated via V13 narrative)
print(f"\nSpot check D-51-001: in supplementary? {'D-51-001' in supplementary_transitions}")
print(f"Spot check D-13V-004: in supplementary? {'D-13V-004' in supplementary_transitions}")
print(f"Spot check D-HM-001: in supplementary? {'D-HM-001' in supplementary_transitions}")
