/**
 * Friends Page - 数据加载
 */

const DataLoader = {
  async load() {
    try {
      LoadingManager.showAll();

      const response = await fetch("/resources/friends.json");
      if (!response.ok) throw new Error("Failed to load data");

      State.linksData = await response.json();
      ContentRenderer.generateAll();
    } catch (error) {
      console.error("Error loading data:", error);
      LoadingManager.showError("Failed to load links data. Please refresh the page.");
    }
  }
};
