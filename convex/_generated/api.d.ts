/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as foundation from "../foundation.js";
import type * as lib_foundationProbe from "../lib/foundationProbe.js";
import type * as releaseIdentity from "../releaseIdentity.js";
import type * as schema_foundationProbes from "../schema/foundationProbes.js";
import type * as schema_registry from "../schema/registry.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  foundation: typeof foundation;
  "lib/foundationProbe": typeof lib_foundationProbe;
  releaseIdentity: typeof releaseIdentity;
  "schema/foundationProbes": typeof schema_foundationProbes;
  "schema/registry": typeof schema_registry;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
