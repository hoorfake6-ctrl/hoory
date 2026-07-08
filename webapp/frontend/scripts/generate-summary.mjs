
import fs from "fs";
import path from "path";

const cwd = process.cwd();
const root = path.resolve(cwd, "../..");
const rawDir = path.join(root, "raw_data");
const dataDir = path.join(root, "data");
const categories = ["drawings", "hentai", "neutral", "porn", "sexy"];

const labels = {
  drawings: "رسومات",
  hentai: "هنتاي",
  neutral: "حيادي",
  porn: "إباحية",
  sexy: "مثير",
};

function countFiles(baseDir) {
  let total = 0;
  if (!fs.existsSync(baseDir)) return 0;
  const stack = [baseDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) total += 1;
    }
  }
  return total;
}

function countLines(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  const content = fs.readFileSync(filePath, "utf8");
  return content.split(/\r?\n/).filter(Boolean).length;
}

function latestEvent(category) {
  const folder = path.join(rawDir, category);
  if (!fs.existsSync(folder)) {
    return { title: category, detail: "—", time: "—" };
  }

  let latestPath = null;
  let latestMtime = -Infinity;
  const stack = [folder];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) {
        const stat = fs.statSync(full);
        if (stat.mtimeMs > latestMtime) {
          latestMtime = stat.mtimeMs;
          latestPath = full;
        }
      }
    }
  }

  if (!latestPath) return { title: category, detail: "—", time: "—" };

  return {
    title: labels[category] || category,
    detail: path.basename(latestPath),
    time: new Date(latestMtime).toISOString().slice(0, 16).replace("T", " "),
  };
}

const raw_counts = Object.fromEntries(
  categories.map((cat) => [cat, countFiles(path.join(rawDir, cat))])
);

const splits = {
  train: Object.fromEntries(categories.map((cat) => [cat, countFiles(path.join(dataDir, "train", cat))])),
  test: Object.fromEntries(categories.map((cat) => [cat, countFiles(path.join(dataDir, "test", cat))])),
};

const source_catalog = categories.map((cat) => {
  const sourceFile = path.join(rawDir, cat, `urls_${cat}.txt`);
  return {
    key: cat,
    label: labels[cat] || cat,
    file: `urls_${cat}.txt`,
    url_count: countLines(sourceFile),
    raw_count: raw_counts[cat],
    train_count: splits.train[cat],
    test_count: splits.test[cat],
  };
});

const totals = {
  raw: Object.values(raw_counts).reduce((a, b) => a + b, 0),
  train: Object.values(splits.train).reduce((a, b) => a + b, 0),
  test: Object.values(splits.test).reduce((a, b) => a + b, 0),
};

const summary = {
  title: "Quina",
  subtitle: "",
  raw_counts,
  splits,
  totals,
  source_catalog,
  recent_events: categories.map(latestEvent),
  last_build: new Date().toISOString().slice(0, 16).replace("T", " "),
  service_state: totals.raw > 0 ? "ready" : "temporary_issue",
};

const outDir = path.join(cwd, "public");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(`Wrote ${path.join(outDir, "summary.json")}`);
