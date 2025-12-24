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
  colorVariables: string[];
  svgo: any;
  componentNameFormat?: string;
};

export type LockFileIcon = {
  name: string;
  tags: string[];
  svg: LockFileIconSvg;
  targets: Record<string, LockFileIconTarget>;
  colorVariableKeys: string[];
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
    | "CREATE_ICON"
    | "REMOVE_ICON"
    | "REGENERATE_ICON"
    | "REGENERATE_ALL";
  filePath?: string;
  iconKey?: string;
  metadata?:
    | { iconKey: string }
    | {
        name: string;
        tags: string[];
        content: string;
        colorMap?: Record<string, string>;
      };
  targetId?: string;
};

export type ActionModel = Change & {
  status: "pending" | "processing" | "completed" | "failed";
  percentage: number;
  error?: string;
};
