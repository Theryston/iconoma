import { Code2, Smartphone } from "lucide-react";
import { ExtraTarget } from "./types";

export const AVAILABLE_TARGETS: ExtraTarget[] = [
  {
    id: "react",
    name: "React",
    icon: Code2,
    extension: [".tsx", ".jsx"],
  },
  {
    id: "react-native",
    name: "React Native",
    icon: Smartphone,
    extension: [".tsx", ".jsx"],
  },
];
