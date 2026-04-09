export class ToolbarParser {
  /**
   * Output: Array of groups, where each group is an array of items.
   * [ ['undo', 'redo'], ['bold', 'italic'], ['align-left', 'align-right'] ]
   */
  static parse(config) {
    if (!config) return [];

    if (Array.isArray(config)) {
      // Ensure 2D array
      return Array.isArray(config[0]) ? config : [config];
    }

    if (typeof config === 'string') {
      return this._parseString(config);
    }

    return [];
  }

  static _parseString(str) {
    // 1. Split by '|' to get groups
    const groups = str.split('|').map(g => g.trim());

    return groups.map(group => {
      // 2. Split by spaces
      const items = group.split(/\s+/).filter(Boolean);

      // We can also parse dropdowns here later.
      // E.g. "align[left,right,center]" -> Object
      return items.map(item => {
        const dropDownMatch = item.match(/(\w+)\[(.*?)\]/);
        if (dropDownMatch) {
          return {
             type: 'dropdown',
             name: dropDownMatch[1],
             items: dropDownMatch[2].split(',')
          };
        }
        return item; // Regular tool
      });
    });
  }
}
