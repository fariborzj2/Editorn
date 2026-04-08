export function renderLucideIcon(iconAst) {
    const innerHtml = iconAst.map(node => {
      const attrs = Object.entries(node[1]).map(([k, v]) => `${k}="${v}"`).join(" ");
      return `<${node[0]} ${attrs}></${node[0]}>`;
    }).join("");
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${innerHtml}</svg>`;
}
