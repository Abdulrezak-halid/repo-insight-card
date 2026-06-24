const START = "<!-- repo-insight-card:start -->";
const END = "<!-- repo-insight-card:end -->";

export function upsertGeneratedSection(readme, generatedSection) {
  // Preserve hand-written README content while replacing only the generated report block.
  const startIndex = readme.indexOf(START);
  const endIndex = readme.indexOf(END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return `${readme.trimEnd()}\n\n${generatedSection}\n`;
  }

  return `${readme.slice(0, startIndex).trimEnd()}\n\n${generatedSection}\n\n${readme.slice(endIndex + END.length).trimStart()}`;
}
