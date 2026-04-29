const heldDependencyUpdates = [
  {
    name: "critters",
    status: "deprecated-support-dependency",
    rationale:
      "Kept as an OpenNext/Next support dependency until the Cloudflare build lane proves a replacement such as beasties is safe.",
  },
  {
    name: "@eslint/js",
    status: "major-held",
    rationale:
      "ESLint major upgrades can change flat-config behavior and rule output; upgrade only in an isolated lint-tooling lane.",
  },
  {
    name: "eslint",
    status: "major-held",
    rationale:
      "ESLint major upgrades can change flat-config behavior and rule output; upgrade only in an isolated lint-tooling lane.",
  },
  {
    name: "eslint-plugin-security",
    status: "major-held",
    rationale:
      "Security lint major upgrades can introduce broad false positives; validate with Semgrep and lint gates in a separate lane.",
  },
  {
    name: "@types/node",
    status: "runtime-baseline-held",
    rationale:
      "The project engine is >=20.19 <23, so Node 25 types would describe APIs outside the supported runtime range.",
  },
  {
    name: "typescript",
    status: "major-held",
    rationale:
      "TypeScript 6 is a compiler major and must be validated in its own type/build lane.",
  },
  {
    name: "eslint-plugin-react-you-might-not-need-an-effect",
    status: "zero-major-minor-held",
    rationale:
      "The package is still 0.x; minor releases may change lint behavior and should be isolated.",
  },
  {
    name: "prettier-plugin-tailwindcss",
    status: "zero-major-minor-held",
    rationale:
      "The package is still 0.x and can create formatting churn; keep it separate from application dependency refreshes.",
  },
];

export const HELD_DEPENDENCY_UPDATES = heldDependencyUpdates;

const heldDependencyUpdateByName = new Map(
  heldDependencyUpdates.map((item) => [item.name, item]),
);

export function getHeldDependencyUpdate(pkg) {
  if (pkg?.vulnerability) {
    return null;
  }

  return heldDependencyUpdateByName.get(pkg?.name) ?? null;
}

export function partitionDependencyUpdates(packages) {
  const actionableUpdates = [];
  const heldUpdates = [];

  for (const pkg of packages) {
    const hold = getHeldDependencyUpdate(pkg);
    if (hold) {
      heldUpdates.push({
        ...pkg,
        hold,
      });
      continue;
    }

    actionableUpdates.push(pkg);
  }

  return {
    actionableUpdates,
    heldUpdates,
  };
}

export function canTreatOutdatedResultAsReviewed(result, parsedPackages) {
  if (result.ok) {
    return true;
  }

  if (parsedPackages.length === 0) {
    return false;
  }

  const { actionableUpdates } = partitionDependencyUpdates(parsedPackages);
  return actionableUpdates.length === 0;
}
