import { defineSchema } from "convex/server";

import { schemaTables } from "./schema/registry";

export default defineSchema(schemaTables);
