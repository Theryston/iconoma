export type ExtraTarget = {
  targetId: string;
  outputPath: string;
};

export type SvgConfig = {
  folder: string | null;
  inLock: boolean;
};

export type Config = {
  svg: SvgConfig;
  extraTargets: ExtraTarget[];
  svgo: any;
};

export type LockFileIcon = {
  name: string;
  tags: string[];
  svg: LockFileIconSvg;
  targets: Record<string, LockFileIconTarget>;
};

export type LockFileIconSvg = {
  content: string;
  hash: string;
};

export type LockFileIconTarget = {
  path: string;
  builtFrom: LockFileBuiltFrom;
};

export type LockFileBuiltFrom = {
  svgHash: string;
  configHash: string;
};

export type LockFile = {
  configHash: string;
  icons: Record<string, LockFileIcon>;
};

export type Change = {
  type:
    | "MIGRATE_SVG_TO_LOCK"
    | "MIGRATE_SVG_TO_FILE"
    | "ADD_EXTRA_TARGET"
    | "REMOVE_EXTRA_TARGET"
    | "REGENERATE_ALL";
  filePath?: string;
  iconKey?: string;
  metadata?: { iconKey: string };
  targetId?: string;
};

export type ActionModel = Change & {
  status: "pending" | "processing" | "completed" | "failed";
  percentage: number;
  error?: string;
};
