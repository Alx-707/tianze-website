const PHASE6_WORKER_CATALOG = [
  {
    key: "gateway",
    suffix: "gateway",
    kind: "gateway",
    deployOrder: 40,
    includeInServerActionsKeySync: true,
    patchPrefetchManifest: false,
  },
  {
    key: "web",
    suffix: "web",
    kind: "web",
    deployOrder: 10,
    includeInServerActionsKeySync: true,
    patchPrefetchManifest: false,
  },
  {
    key: "apiLead",
    suffix: "api-lead",
    kind: "api",
    binding: "WORKER_API_LEAD",
    deployOrder: 20,
    includeInServerActionsKeySync: true,
    patchPrefetchManifest: true,
  },
];

const PHASE6_WORKERS_BY_KEY = Object.freeze(
  Object.fromEntries(
    PHASE6_WORKER_CATALOG.map((worker) => [worker.key, worker]),
  ),
);

const PHASE6_API_WORKERS = Object.freeze(
  PHASE6_WORKER_CATALOG.filter((worker) => worker.kind === "api"),
);

function getPhase6WorkerDescriptor(workerKey) {
  const worker = PHASE6_WORKERS_BY_KEY[workerKey];
  if (!worker) {
    throw new Error(`[phase6-topology] unknown worker key: ${workerKey}`);
  }
  return worker;
}

function getPhase6WorkerName(baseWorkerName, workerKey) {
  return `${baseWorkerName}-${getPhase6WorkerDescriptor(workerKey).suffix}`;
}

function getPhase6WorkerNames(baseWorkerName) {
  return Object.fromEntries(
    PHASE6_WORKER_CATALOG.map((worker) => [
      worker.key,
      getPhase6WorkerName(baseWorkerName, worker.key),
    ]),
  );
}

function getPhase6ConfigFileName(workerKey) {
  return `${getPhase6WorkerDescriptor(workerKey).suffix}.jsonc`;
}

function getPhase6DeploymentOrder() {
  return [...PHASE6_WORKER_CATALOG]
    .sort((left, right) => left.deployOrder - right.deployOrder)
    .map((worker) => getPhase6ConfigFileName(worker.key));
}

function getPhase6ServerActionsKeyWorkerNames(baseWorkerName) {
  return PHASE6_WORKER_CATALOG.filter(
    (worker) => worker.includeInServerActionsKeySync,
  ).map((worker) => getPhase6WorkerName(baseWorkerName, worker.key));
}

function getPhase6PatchPrefetchWorkerKeys() {
  return PHASE6_WORKER_CATALOG.filter(
    (worker) => worker.patchPrefetchManifest,
  ).map((worker) => worker.key);
}

export {
  PHASE6_API_WORKERS,
  PHASE6_WORKER_CATALOG,
  PHASE6_WORKERS_BY_KEY,
  getPhase6ConfigFileName,
  getPhase6DeploymentOrder,
  getPhase6PatchPrefetchWorkerKeys,
  getPhase6WorkerDescriptor,
  getPhase6WorkerName,
  getPhase6WorkerNames,
  getPhase6ServerActionsKeyWorkerNames,
};
