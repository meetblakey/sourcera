## Appendix G: PostHog Event Taxonomy

| Event | Trigger | Key Properties |
| :---- | :---- | :---- |
| `ui_responsive_breakpoint_crossed` | sampled event | `sampling_rate=0.1` |
| `ui_mobile_tap_count_probe_exceeded` | unsampled event | `sampling_rate=1.0` |

## Appendix J: Enum Registry

#### `sampling_rate_kind`

`1.0`, `0.2`, `0.1`, `0.01`
