/**
 * plugin.js
 * Simple plugin system for Web3 dApp
 */

class PluginManager {
  constructor() {
    this.plugins = new Map();
  }

  /**
   * Register a plugin
   * @param {string} name
   * @param {object} plugin
   */
  register(name, plugin) {
    if (this.plugins.has(name)) {
      console.warn(`[PluginManager] Plugin "${name}" already registered`);
      return;
    }

    if (typeof plugin.init !== "function") {
      throw new Error(`Plugin "${name}" must have an init() method`);
    }

    this.plugins.set(name, plugin);
  }

  /**
   * Initialize all plugins
   * @param {object} context - shared app context
   */
  async initAll(context = {}) {
    for (const [name, plugin] of this.plugins.entries()) {
      try {
        console.log(`[PluginManager] Initializing ${name}...`);
        await plugin.init(context);
      } catch (err) {
        console.error(`[PluginManager] Failed to init ${name}:`, err);
      }
    }
  }

  /**
   * Execute hook across plugins
   * @param {string} hook
   * @param  {...any} args
   */
  async runHook(hook, ...args) {
    for (const plugin of this.plugins.values()) {
      if (typeof plugin[hook] === "function") {
        try {
          await plugin[hook](...args);
        } catch (err) {
          console.error(`[PluginManager] Hook error (${hook}):`, err);
        }
      }
    }
  }
}

export default new PluginManager();
