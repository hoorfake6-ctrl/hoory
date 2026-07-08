import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const cwd = process.cwd();
const root = path.resolve(cwd, "../..");
const rawDir = path.join(root, "raw_data");
const dataDir = path.join(root, "data");
const categories = ["drawings", "hentai", "neutral", "porn", "sexy"];

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

function latestEvent(category) {
  const folder = path.join(rawDir, category);
  if (!fs.existsSync(folder)) {
    return { title: category, detail: "لا توجد ملفات حديثة", time: "—" };
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

  if (!latestPath) return { title: category, detail: "لا توجد ملفات حديثة", time: "—" };

  return {
    title: category,
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

const totals = {
  raw: Object.values(raw_counts).reduce((a, b) => a + b, 0),
  train: Object.values(splits.train).reduce((a, b) => a + b, 0),
  test: Object.values(splits.test).reduce((a, b) => a + b, 0),
};

const summary = {
  title: "Quina",
  subtitle: "لوحة منظمة لعرض حالة البيانات والنماذج",
  raw_counts,
  splits,
  totals,
  recent_events: categories.map(latestEvent),
  last_build: new Date().toISOString().slice(0, 16).replace("T", " "),
  service_state: totals.raw > 0 ? "ready" : "temporary_issue",
  note: totals.raw > 0 ? "تمت قراءة بيانات المشروع محليًا بنجاح." : "البيانات غير مكتملة حاليًا، لذلك يظهر الوضع كتعطل مؤقت.",
};

const outDir = path.join(cwd, "public");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(`Wrote ${path.join(outDir, "summary.json")}`);
