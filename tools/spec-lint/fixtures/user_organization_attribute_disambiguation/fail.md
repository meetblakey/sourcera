# User Organization Attribute Disambiguation Fail Fixture

### 4.2.3 User (Global) {#4.2.3-user-(global)}

| Field | Type | Constraints | Notes |
| :---- | :---- | :---- | :---- |
| `organization_attribute` | String | nullable | Sourcera Organization ID for tenant membership. |

Use `User.organization_attribute` as the Organization (`org_id`) membership FK when resolving Org access.
