import json
import re
from collections import defaultdict, Counter

with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/p2_open.json") as f:
    p2 = json.load(f)
with open("/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_tmp/p3_open.json") as f:
    p3 = json.load(f)

# Phase normalization — extract base phase
def norm_phase(p):
    p = p.strip()
    # Strip wrapping markers
    p = re.sub(r'^\*+|\*+$', '', p).strip()
    return p

# Build phase mnemonic for cluster IDs
def phase_mnemonic(p):
    # Examples: "Phase 8" -> "PH08", "Phase 2.2" -> "PH22", "Phase 4 (Prompt 4.11)" -> "PH4P411"
    # "Phase S17" -> "PHS17", "Phase V11" -> "PHV11", "Phase V12" -> "PHV12"
    p = p.replace("Phase ", "")
    # Extract main token
    m = re.match(r'^(\S+)', p)
    main = m.group(1) if m else p
    main = main.replace(".", "")
    rest = p[len(main):].strip()
    promptm = re.search(r'Prompt (\S+)', rest)
    if promptm:
        prompt = promptm.group(1).replace(".", "")
        return f"PH{main}P{prompt}"
    return f"PH{main}"

# Class mnemonic
CLASS_MNEMONIC = {
    "acceptance_criteria": "AC",
    "documentation_gap": "DOC",
    "consistency_drift": "DRIFT",
    "data_model": "DATA",
    "observability": "OBS",
    "numerical_singleton": "NUM",
    "ci_gate": "CIGATE",
    "mobile_divergence": "MOB",
    "enum": "ENUM",
    "state_machine": "SM",
    "retention": "RET",
    "surface_engine_mapping": "MAP",
    "api": "API",
    "rbac": "RBAC",
    "firewall_leakage": "FW",
    "authored_extension": "AE",
    "dsar": "DSAR",
    "plan_gating": "GATE",
    "webhook": "HOOK",
    "accessibility": "A11Y",
    "residency": "RES",
    "instrumentation_gap": "INST",
    "glossary": "GLOSS",
    "posthog_event": "PH",
    "edge_case_silence": "EDGE",
    "notification": "NOTIF",
    "i18n": "I18N",
    "test_coverage": "TEST",
    "error_code": "ERR",
    "network_effect_gap": "NET",
    "edge_case": "EDGE",
    "performance_budget": "PERF",
    "error_state": "ERRS",
    "retry_idempotency": "RETRY",
    "empty_state": "EMPTY",
    "entitlement": "ENT",
    "privacy": "PRIV",
    "downgrade_path": "DOWN",
    "documentation_drift": "DOCDRIFT",
    "heading_syntax": "HEAD",
    "glossary_canonicality": "GLOSS",
    "ux_copy": "COPY",
}

def class_mnemonic(c):
    c = c.strip()
    # Handle compound classes like "data_model / residency"
    if "/" in c:
        c = c.split("/")[0].strip()
    return CLASS_MNEMONIC.get(c, c.upper().replace("_", "")[:6])

# Extract section anchor from location
def extract_section(loc):
    m = re.search(r'§([\d.]+)', loc)
    if m:
        return f"§{m.group(1)}"
    m = re.search(r'Appendix\s+([A-Z])', loc)
    if m:
        return f"Appendix {m.group(1)}"
    return "—"

# Cluster: by (phase, class) 
def cluster_p2(defects):
    clusters = defaultdict(list)
    for d in defects:
        key = (norm_phase(d["phase"]), d["class"])
        clusters[key].append(d)
    return clusters

p2_clusters = cluster_p2(p2)

# Effort sizing
def effort(n):
    if n <= 3:
        return "S"
    if n <= 10:
        return "M"
    if n <= 25:
        return "L"
    return "XL"

# Pack inference based on class
def infer_pack(cls, sections):
    cls_l = cls.lower()
    section_str = " ".join(sections).lower()
    if "ci_gate" in cls_l:
        return "M02.3"
    if "rbac" in cls_l or "firewall_leakage" in cls_l or "dsar" in cls_l or "residency" in cls_l or "retention" in cls_l:
        return "M11.3"
    if "data_model" in cls_l or "enum" in cls_l or "state_machine" in cls_l or "api" in cls_l or "webhook" in cls_l:
        return "M02.3"
    if "observability" in cls_l or "instrumentation_gap" in cls_l or "posthog_event" in cls_l:
        return "M21.3"
    if "plan_gating" in cls_l or "entitlement" in cls_l:
        return "M11.3"
    if "surface_engine_mapping" in cls_l or "authored_extension" in cls_l:
        return "release-orchestration"
    if "documentation" in cls_l or "glossary" in cls_l or "heading" in cls_l:
        return "—"
    return "—"

# Owner: most common
def common_owner(defects):
    c = Counter(d["owner"] for d in defects if d["owner"])
    return c.most_common(1)[0][0] if c else "—"

# Truncate
def trunc(s, n=140):
    s = s.strip().strip("`").strip()
    if len(s) > n:
        return s[:n-1].rstrip() + "…"
    return s

# Sample 3 IDs per cluster (sorted by id)
def sample_ids(defects, k=3):
    ids = sorted(d["id"] for d in defects)
    if len(ids) <= k:
        return ", ".join(ids)
    return ", ".join(ids[:k]) + f", + {len(ids)-k}"

# Sections list
def sections(defects):
    secs = sorted(set(extract_section(d["location"]) for d in defects))
    return ", ".join(secs[:5]) + ("…" if len(secs) > 5 else "")

# Build cluster rows
cluster_rows = {}
for (phase, cls), defects in p2_clusters.items():
    pm = phase_mnemonic(phase)
    cm = class_mnemonic(cls)
    cid = f"BL-P2-{pm}-{cm}"
    summary_src = defects[0]["summary"]
    rec_src = defects[0]["recommendation"]
    secs = sections(defects)
    owner = common_owner(defects)
    pack = infer_pack(cls, [d["location"] for d in defects])
    cluster_rows[(phase, cls)] = {
        "id": cid,
        "phase": phase,
        "class": cls,
        "count": len(defects),
        "sample_ids": sample_ids(defects, 3),
        "sections": secs,
        "summary": trunc(summary_src, 140),
        "recommendation": trunc(rec_src, 140),
        "owner": owner if owner else "—",
        "pack": pack,
        "effort": effort(len(defects)),
        "defects": defects,
    }

# Group clusters by phase
phase_to_clusters = defaultdict(list)
for (phase, cls), row in cluster_rows.items():
    phase_to_clusters[phase].append(row)

# Order phases by total defect count desc
phase_totals = {ph: sum(r["count"] for r in rows) for ph, rows in phase_to_clusters.items()}
phases_sorted = sorted(phase_to_clusters.keys(), key=lambda p: -phase_totals[p])

# Top 25 by size
all_clusters_by_size = sorted(cluster_rows.values(), key=lambda r: -r["count"])
top25 = all_clusters_by_size[:25]

# Cross-phase programs: same class appearing in >= 3 phases
class_to_phases = defaultdict(set)
class_to_total = defaultdict(int)
class_to_sample_phases = defaultdict(list)
for (phase, cls), row in cluster_rows.items():
    class_to_phases[cls].add(phase)
    class_to_total[cls] += row["count"]
    class_to_sample_phases[cls].append((phase, row["count"]))

cross_phase = [(cls, len(phases)) for cls, phases in class_to_phases.items() if len(phases) >= 3]
cross_phase.sort(key=lambda x: -class_to_total[x[0]])

# ============ P3 Class roll-up ============
p3_by_class = defaultdict(list)
for d in p3:
    p3_by_class[d["class"]].append(d)

p3_class_rollup = []
for i, (cls, defects) in enumerate(sorted(p3_by_class.items(), key=lambda x: -len(x[1])), 1):
    phases = sorted(set(norm_phase(d["phase"]) for d in defects))
    sample = sample_ids(defects, 3)
    # Recommendation: aggregate hygiene approach
    rec_src = defects[0]["recommendation"]
    p3_class_rollup.append({
        "class": cls,
        "count": len(defects),
        "phases": ", ".join(phases[:6]) + ("…" if len(phases) > 6 else ""),
        "sample": sample,
        "recommendation": trunc(rec_src, 140),
        "linear_id": f"DOC-{i:03d}",
    })

# P3 phase-by-phase roster
p3_by_phase = defaultdict(list)
for d in p3:
    p3_by_phase[norm_phase(d["phase"])].append(d)

p3_phase_roster = []
for phase in sorted(p3_by_phase.keys()):
    ids = sorted(d["id"] for d in p3_by_phase[phase])
    p3_phase_roster.append((phase, ids))

# ============ OUTPUT ============
out_lines = []
out_lines.append("# P2 + P3 Cluster Inventory (open defects only)\n")
out_lines.append("")
out_lines.append("## Pre-flight counts")
out_lines.append(f"P2 open: {len(p2)}")
out_lines.append(f"P3 open: {len(p3)}")
total_phases = len(set(list(phase_to_clusters.keys()) + [norm_phase(d['phase']) for d in p3]))
out_lines.append(f"Phases: {total_phases}")
total_clusters = len(cluster_rows)
out_lines.append(f"Clusters: {total_clusters} (P2 phase×class) + {len(p3_class_rollup)} (P3 class roll-up)")
out_lines.append("")

# P2 — Per-phase clusters
out_lines.append("## P2 — Per-phase clusters")
out_lines.append("")
for phase in phases_sorted:
    rows = sorted(phase_to_clusters[phase], key=lambda r: -r["count"])
    phase_total = sum(r["count"] for r in rows)
    out_lines.append(f"### {phase} ({phase_total} defects, {len(rows)} clusters)")
    out_lines.append("")
    out_lines.append("| Cluster ID | Count | Sample IDs | Class | Sections | Summary | Recommendation | Owner | Pack | Effort |")
    out_lines.append("|---|---:|---|---|---|---|---|---|---|---|")
    for r in rows:
        # Escape pipes inside content
        def esc(s):
            return s.replace("|", "\\|").replace("\n", " ")
        out_lines.append(
            f"| {r['id']} | {r['count']} | {esc(r['sample_ids'])} | {esc(r['class'])} | {esc(r['sections'])} | {esc(r['summary'])} | {esc(r['recommendation'])} | {esc(r['owner'])} | {r['pack']} | {r['effort']} |"
        )
    out_lines.append("")

# P2 — Top-25 by size
out_lines.append("## P2 — Top-25 by size")
out_lines.append("")
out_lines.append("| Cluster ID | Phase | Class | Count | Pack | Effort |")
out_lines.append("|---|---|---|---:|---|---|")
for r in top25:
    out_lines.append(f"| {r['id']} | {r['phase']} | {r['class']} | {r['count']} | {r['pack']} | {r['effort']} |")
out_lines.append("")

# P2 — Cross-phase programs
out_lines.append("## P2 — Cross-phase programs (≥3 phases same class)")
out_lines.append("")
out_lines.append("| Class | Phase Count | Defect Count | Sample Phases | Suggested Program |")
out_lines.append("|---|---:|---:|---|---|")
for cls, ph_count in cross_phase:
    samples = sorted(class_to_sample_phases[cls], key=lambda x: -x[1])[:5]
    sample_str = ", ".join(f"{p} ({n})" for p, n in samples)
    pack = infer_pack(cls, [])
    program = f"Cross-phase {cls} sweep (pack={pack})"
    out_lines.append(f"| {cls} | {ph_count} | {class_to_total[cls]} | {sample_str} | {program} |")
out_lines.append("")

# P3 — Class roll-up
out_lines.append("## P3 — Class roll-up (single hygiene sweep epic)")
out_lines.append("")
out_lines.append("| Class | Count | Phases | Sample IDs | Recommendation | Linear ID |")
out_lines.append("|---|---:|---|---|---|---|")
for r in p3_class_rollup:
    def esc(s):
        return s.replace("|", "\\|").replace("\n", " ")
    out_lines.append(
        f"| {esc(r['class'])} | {r['count']} | {esc(r['phases'])} | {esc(r['sample'])} | {esc(r['recommendation'])} | {r['linear_id']} |"
    )
out_lines.append("")

# P3 — Phase-by-phase roster
out_lines.append("## P3 — Phase-by-phase roster (compact)")
out_lines.append("")
for phase, ids in p3_phase_roster:
    truncated_ids = ids if len(ids) <= 30 else ids[:30] + [f"… (+{len(ids)-30} more)"]
    out_lines.append(f"- **{phase}**: {', '.join(truncated_ids)} ({len(ids)} defects)")
out_lines.append("")

OUT = "/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/_scratch_p2_p3_clusters.md"
with open(OUT, "w") as f:
    f.write("\n".join(out_lines))

print(f"Written to {OUT}")
print(f"P2 clusters: {len(cluster_rows)}, P2 phases: {len(phase_to_clusters)}, P2 defects: {len(p2)}")
print(f"P3 class roll-ups: {len(p3_class_rollup)}, P3 phases: {len(p3_by_phase)}, P3 defects: {len(p3)}")
