import { generateMain } from "../../../../../lib/mirage-x/unit/main";
import { unitConfig } from "./detail";

/**
 * Resoniteで指定したユーザーに銃を装備させることを管理するユニット
 * 銃本体ではない
 */
export const o = generateMain(unitConfig);
