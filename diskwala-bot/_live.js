require("dotenv").config();
const diskwala = require("./src/diskwala");
(async () => {
  const fid = diskwala.extractFileId("https://www.diskwala.com/app/6a65c72a06ba7ea03da1bdc7");
  console.log("fileId:", fid);
  try {
    const info = await diskwala.resolveFile(fid);
    console.log("RESULT:");
    console.log(JSON.stringify(info, null, 2).slice(0, 1500));
  } catch (e) {
    console.log("FAILED:", e.message);
  }
  process.exit(0);
})();
