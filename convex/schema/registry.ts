import type { GenericSchema } from "convex/server";

import { foundationProbesSchemaFragment } from "./foundationProbes";

export interface SchemaFragment<
  Name extends string = string,
  Tables extends GenericSchema = GenericSchema,
> {
  name: Name;
  tables: Tables;
}

type UnionToIntersection<Union> = (
  Union extends unknown ? (value: Union) => void : never
) extends (value: infer Intersection) => void
  ? Intersection
  : never;

type FragmentTables<Fragments extends readonly SchemaFragment[]> =
  UnionToIntersection<Fragments[number]["tables"]>;

function stableCompare(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function assembleSchemaFragments<
  const Fragments extends readonly SchemaFragment[],
>(
  fragments: Fragments,
  expectedFragmentNames: readonly string[],
): FragmentTables<Fragments> {
  const expected = [...expectedFragmentNames].sort(stableCompare);
  const orderedFragments = [...fragments].sort((left, right) =>
    stableCompare(left.name, right.name),
  );
  for (let index = 1; index < orderedFragments.length; index += 1) {
    if (orderedFragments[index - 1].name === orderedFragments[index].name) {
      throw new Error(
        `duplicate Convex schema fragment: ${orderedFragments[index].name}`,
      );
    }
  }
  const actual = orderedFragments.map((fragment) => fragment.name);
  const actualNames = new Set(actual);
  const expectedNames = new Set(expected);
  for (const name of expected) {
    if (!actualNames.has(name)) {
      throw new Error(`missing Convex schema fragment: ${name}`);
    }
  }
  for (const name of actual) {
    if (!expectedNames.has(name)) {
      throw new Error(`unregistered Convex schema fragment: ${name}`);
    }
  }

  const tables: GenericSchema = {};
  const indexNames = new Set<string>();
  for (const fragment of orderedFragments) {
    for (const tableName of Object.keys(fragment.tables).sort(stableCompare)) {
      if (Object.hasOwn(tables, tableName)) {
        throw new Error(`duplicate Convex table: ${tableName}`);
      }
      const table = fragment.tables[tableName];
      for (const index of table[" indexes"]()) {
        if (indexNames.has(index.indexDescriptor)) {
          throw new Error(`duplicate Convex index: ${index.indexDescriptor}`);
        }
        indexNames.add(index.indexDescriptor);
      }
      tables[tableName] = table;
    }
  }
  return Object.freeze(tables) as FragmentTables<Fragments>;
}

export const registeredSchemaFragments = Object.freeze([
  foundationProbesSchemaFragment,
] as const);

export const registeredSchemaFragmentFiles = Object.freeze([
  "foundationProbes.ts",
] as const);

export const schemaTables = assembleSchemaFragments(
  registeredSchemaFragments,
  registeredSchemaFragmentFiles.map((fileName) => fileName.replace(/\.ts$/, "")),
);
