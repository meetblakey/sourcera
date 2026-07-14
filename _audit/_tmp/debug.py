LEDGER = "/sessions/zealous-adoring-hypatia/mnt/Sourcera/_audit/DEFECT_LEDGER.md"
with open(LEDGER) as f:
    lines = f.readlines()
# Test on line 859 (D-AK-001 row)
line = lines[858]  # 0-indexed
print(repr(line[:300]))
parts = [p.strip() for p in line.strip().strip("|").split("|")]
print(f"len={len(parts)}")
for i, p in enumerate(parts):
    print(f"  [{i}] {p[:100]}")
