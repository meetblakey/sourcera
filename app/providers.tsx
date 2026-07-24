"use client";

import { readConvexDeploymentUrl } from "@sourcera/domain/convex";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState } from "react";

export function SourceraConvexProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const deploymentUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const [client] = useState(() =>
    deploymentUrl
      ? new ConvexReactClient(readConvexDeploymentUrl(deploymentUrl))
      : null,
  );

  if (!client) return children;

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
