import { mkdir, writeFile } from 'node:fs/promises';

const files = [
  ['https://upload.wikimedia.org/wikipedia/commons/3/3e/King_Abdullah_Park_Riyadh_lake.jpg', 'public/images/park-lake.jpg'],
  ['https://upload.wikimedia.org/wikipedia/commons/b/b6/King_Abdullah_Park_Riyadh_entrance.jpg', 'public/images/park-entrance.jpg'],
];
await mkdir('public/images', { recursive: true });
for (const [url, path] of files) {
  const res = await fetch(url, { headers: { 'user-agent': 'KingAbdullahParkGuide/1.0 (non-profit educational project)' } });
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  await writeFile(path, Buffer.from(await res.arrayBuffer()));
  console.log(`saved ${path}`);
}
