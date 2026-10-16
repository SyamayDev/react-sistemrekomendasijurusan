/** App-level wiring: binds the pure engine to SI-RAJU's datasets. */
import questions from "../data/questions.json";
import majors from "../data/majors.json";
import { buildModel } from "./engine.js";

export { questions, majors };

let model;
/** The model precomputes per-question evidence for 150 majors — build it on first use only. */
export function getModel() {
  model ||= buildModel(questions, majors);
  return model;
}
