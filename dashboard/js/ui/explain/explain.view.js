// js/ui/explain/explain.view.js

import { openExplainModal } from "./explain.modal.js";
import { renderExplainContent } from "./explain.template.js";

/**
 * Called from UI (incident card)
 */
export function showExplain(explainObject) {
  const html = renderExplainContent(explainObject);
  openExplainModal(html);
}
