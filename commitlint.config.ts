import type { UserConfig } from "@commitlint/types";
const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: { "type-enum": [2, "always", ["feat","fix","test","chore","docs","refactor","perf","style","ci","build","revert"]] },
};
export default config;
