(() => {
  const link = document.querySelector("[data-star-backend]");
  if (!link) return;
  const backend = new URL(link.dataset.starBackend);

  async function available() {
    try {
      const response = await fetch(new URL("health", backend), {
        signal: AbortSignal.timeout(2500), cache: "no-store", credentials: "omit"
      });
      return response.ok && (await response.json()).service === "physresponse-star";
    } catch { return false; }
  }
  available().then(ok => {
    if (!ok) return;
    const connect = document.createElement("a");
    connect.href = new URL("authorize", backend);
    connect.textContent = "Enable one-click Star";
    const resources = document.querySelector("#resources");
    if (resources) resources.appendChild(connect);
  });
  link.addEventListener("click", async (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    window.location.assign(await available() ? new URL("star", backend) : link.href);
  });
})();
