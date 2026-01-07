export function calculateScore(answers, questions, majors) {
  // New scoring:
  // - For each question and each major, contribution = (selectedValue / maxOptionValue) * weight
  // - For checkbox: selectedValue = sum(selected option values)
  // - Aggregate per-major contributions; maxPossible per major = sum(weights)
  const scores = {};
  const maxPossible = {};

  majors.forEach((m) => {
    scores[m.id] = 0;
    maxPossible[m.id] = 0;
  });

  questions.forEach((q) => {
    const weights = q.bobot_jurusan || {};
    const response = answers[q.id];
    const maxOpt =
      q.opsi && q.opsi.length
        ? Math.max(...q.opsi.map((o) => o.value || 0))
        : 0;

    majors.forEach((m) => {
      const w = weights[m.id] || 0;
      // total possible weight contribution for normalization
      maxPossible[m.id] += w;

      if (q.tipe === "text" || w === 0) return;

      let selValue = 0;
      if (q.tipe === "yesno" || q.tipe === "multiple" || q.tipe === "scale") {
        if (response == null) return;
        selValue =
          typeof response === "number"
            ? response
            : response && response.value != null
            ? response.value
            : 0;
      } else if (q.tipe === "checkbox") {
        if (!Array.isArray(response)) return;
        selValue = response.reduce((s, r) => s + (r.value || 0), 0);
      }

      // avoid division by zero; if maxOpt is zero treat as zero contribution
      const ratio = maxOpt > 0 ? Math.min(1, selValue / maxOpt) : 0;
      scores[m.id] += ratio * w;
    });
  });

  return { scores, maxPossible };
}
