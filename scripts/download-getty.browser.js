async (page, { ids, downloadDirectory }) => {
  if (!downloadDirectory) throw new Error("Supply the approved local download directory.");
  const tab = page.__gettyPersistentPage;
  if (!tab || tab.isClosed()) throw new Error("The dedicated signed-in Getty browser is unavailable.");
  page.__gettyDownloadEvidence ||= [];
  const queue = await (await page.request.get("http://localhost:4193/GETTY-DOWNLOAD-QUEUE.csv")).text();
  const rows = queue.replace(/^\uFEFF/, "").trim().split(/\r?\n/).slice(1).map(line =>
    [...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)].map(match => match[1].replaceAll('""', '"')));
  const records = [];
  for (const id of ids) {
    if (page.__gettyDownloadEvidence.some(record => record.id === id)) {
      throw new Error(`Asset ${id} was already downloaded in this session; do not repeat the download.`);
    }
    const row = rows.find(row => row[0] === id);
    if (!row) throw new Error(`Unreviewed Getty asset ${id}`);
    if (row[8].startsWith("Downloaded")) throw new Error(`Getty ${id} is already installed according to the durable queue; do not download again.`);
    await tab.goto(row[1], { waitUntil: "domcontentloaded" });
    await tab.getByText("Content available with your current agreements", { exact: false }).waitFor({ timeout: 20000 });
    await tab.getByRole("button", { name: "DOWNLOAD", exact: true }).waitFor({ timeout: 20000 });
    const sizes = await tab.locator('input[type="radio"]').evaluateAll(inputs =>
      inputs.map(input => ({ id: input.id, checked: input.checked })));
    const largest = ["L", "M", "S"].find(size => sizes.some(input => input.id === size));
    if (!largest) throw new Error(`No normal image-size selector for asset ${id}`);
    if (!sizes.find(input => input.id === largest).checked) {
      await tab.getByText({ L: "Large", M: "Medium", S: "Small" }[largest], { exact: true }).click();
    }
    const body = await tab.locator("body").innerText();
    const panel = body.split("PREMIUM ACCESS")[1]?.split("DETAILS")[0];
    if (!panel || !body.includes("Content available with your current agreements")
      || !new RegExp(`Creative #:\\s*${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`).test(body)
      || !/License type:\s*Royalty-free/.test(body)
      || /editorial use only|editorial-only/i.test(body)
      || /\b(?:buy now|purchase|checkout|credits?|accept terms|agree to terms|pay now)\b/i.test(panel)) {
      throw new Error(`Agreement, royalty-free or transaction guard failed for Getty ${id}. Stop for review.`);
    }
    const button = tab.getByRole("button", { name: "DOWNLOAD", exact: true });
    if (await button.count() !== 1) throw new Error(`No unique normal DOWNLOAD action for Getty ${id}`);
    const downloadEvent = tab.waitForEvent("download", { timeout: 30000 });
    await button.click();
    const download = await downloadEvent;
    const file = `${downloadDirectory}\\GettyImages-${id}.jpg`;
    await download.saveAs(file);
    const failure = await download.failure();
    if (failure) throw new Error(`Getty ${id} download failed: ${failure}`);
    const record = {
      id, file, source: tab.url(), selectedSize: { L: "Large", M: "Medium", S: "Small" }[largest],
      selectedSizeText: panel.replace(/\s+/g, " ").trim(),
      licenseType: "Royalty-free", family: "Creative",
      releaseInfo: body.match(/Release info:\s*([^\n]+)/)?.[1],
      premiumAccess: true, currentAgreementAvailable: true, editorialOnlyNoticeObserved: false,
      downloadedOn: new Date().toISOString(),
    };
    page.__gettyDownloadEvidence.push(record);
    records.push(record);
  }
  return records;
}
