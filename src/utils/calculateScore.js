export function calculateScore(answers, questions, majors) {
  // `scores` will store the accumulated weighted score for each major.
  const scores = {};
  // `maxPossible` will store the sum of all applicable weights for each major,
  // representing the theoretical maximum score if all answers perfectly matched a major's preferences.
  const maxPossible = {};

  // Initialize scores and maxPossible for each major to zero.
  majors.forEach((m) => {
    scores[m.id] = 0;
    maxPossible[m.id] = 0;
  });

  // Iterate over each question to process user answers and calculate contributions to major scores.
  questions.forEach((q) => {
    // `weights` are the specific `bobot_jurusan` values for the current question,
    // indicating its importance for different majors.
    const weights = q.bobot_jurusan || {};
    // `response` is the user's answer for the current question.
    const response = answers[q.id];
    // `maxOpt` determines the maximum possible value a user can select for this question,
    // used for normalizing the user's response to a 0-1 range.
    const maxOpt =
      q.opsi && q.opsi.length
        ? Math.max(...q.opsi.map((o) => o.value || 0))
        : 0;

    // Iterate over each major to apply question weights and calculate scores.
    majors.forEach((m) => {
      // `w` is the weight of the current question for the current major.
      const w = weights[m.id] || 0;
      
      // Accumulate the maximum possible weight for this major, regardless of user answer.
      // This forms the basis for overall normalization later.
      maxPossible[m.id] += w;

      // Skip text input questions as they don't directly contribute to numerical scoring,
      // or if the weight for this major is zero.
      if (q.tipe === "text" || w === 0) return;

      let selValue = 0; // `selValue` will store the numerical value of the user's answer.
      if (q.tipe === "yesno" || q.tipe === "multiple" || q.tipe === "scale") {
        if (response == null) return; // If no response, skip.
        selValue =
          typeof response === "number"
            ? response // Direct number value for scale
            : response && response.value != null
            ? response.value // Value from selected option for yesno/multiple
            : 0;
      } else if (q.tipe === "checkbox") {
        if (!Array.isArray(response)) return; // If no array response, skip.
        // For checkbox, `selValue` is the sum of values of all selected options.
        selValue = response.reduce((s, r) => s + (r.value || 0), 0);
      }

      // Calculate `ratio` to normalize the user's answer (selValue) based on the question's maximum option value (maxOpt).
      // This ensures that answers are scaled to a 0-1 range.
      // Avoid division by zero: if `maxOpt` is zero, the contribution is zero.
      const ratio = maxOpt > 0 ? Math.min(1, selValue / maxOpt) : 0;
      
      // Add the weighted contribution of this question to the major's total score.
      // The `ratio` scales the user's answer, and `w` applies the question's importance to the major.
      scores[m.id] += ratio * w;
    });
  });

  // Returns the raw scores for each major and their respective maximum possible scores,
  // which will be used for final normalization into percentages.
  return { scores, maxPossible };
}
