import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const IMAGES_DIR = path.resolve("../all-blue/public/images");

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const base = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);
    const unique = `${base}-${Date.now()}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    cb(null, allowed.includes(file.mimetype));
  },
});

async function requireAdmin(userId: number | null): Promise<boolean> {
  if (!userId) return false;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return user?.role === "admin";
}

router.post("/upload/menu-image", upload.single("image"), async (req, res): Promise<void> => {
  const rawId = req.headers["x-user-id"];
  const userId = parseInt(String(rawId ?? ""), 10);
  if (!(await requireAdmin(isNaN(userId) ? null : userId))) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "No image file provided" });
    return;
  }

  // If ImageKit is configured in environment, upload to it directly
  if (process.env.IMAGEKIT_PRIVATE_KEY) {
    try {
      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
      const fileBuffer = fs.readFileSync(req.file.path);
      const blob = new Blob([fileBuffer], { type: req.file.mimetype });
      
      const formData = new FormData();
      formData.append("file", blob, req.file.filename);
      formData.append("fileName", req.file.filename);
      formData.append("useUniqueFileName", "true");
      formData.append("folder", "/all-blue");

      const authHeader = "Basic " + Buffer.from(privateKey + ":").toString("base64");

      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        headers: {
          Authorization: authHeader,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ImageKit upload API error: ${response.status} ${errorText}`);
      }

      const result = await response.json() as { url: string };

      // Clean up the local file since it's now securely on ImageKit
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        // ignore unlink error
      }

      res.json({ url: result.url });
      return;
    } catch (uploadError) {
      console.error("ImageKit upload failed, falling back to local storage:", uploadError);
      // Fall through to local fallback
    }
  }

  const url = `/images/${req.file.filename}`;
  res.json({ url });
});

router.post("/upload/chef-image", upload.single("image"), async (req, res): Promise<void> => {
  const rawId = req.headers["x-user-id"];
  const userId = parseInt(String(rawId ?? ""), 10);
  if (!(await requireAdmin(isNaN(userId) ? null : userId))) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "No image file provided" });
    return;
  }

  if (process.env.IMAGEKIT_PRIVATE_KEY) {
    try {
      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
      const fileBuffer = fs.readFileSync(req.file.path);
      const blob = new Blob([fileBuffer], { type: req.file.mimetype });
      const formData = new FormData();
      formData.append("file", blob, req.file.filename);
      formData.append("fileName", req.file.filename);
      formData.append("useUniqueFileName", "true");
      formData.append("folder", "/all-blue/chefs");
      const authHeader = "Basic " + Buffer.from(privateKey + ":").toString("base64");
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        headers: { Authorization: authHeader },
        body: formData,
      });
      if (!response.ok) throw new Error(`ImageKit error: ${response.status}`);
      const result = await response.json() as { url: string };
      try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }
      res.json({ url: result.url });
      return;
    } catch (uploadError) {
      console.error("ImageKit chef upload failed, falling back to local storage:", uploadError);
    }
  }

  const url = `/images/${req.file.filename}`;
  res.json({ url });
});

export default router;
