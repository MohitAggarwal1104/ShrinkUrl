// import { Router } from "express";
// import crypto from "node:crypto";
// import ShortUrl from "../models/ShortUrl.js";
// import { requireAuth } from "../middleware/auth.js";

// const router = Router();
// const ALIAS_RE = /^[a-zA-Z0-9_-]{3,30}$/;

// function validHttpUrl(value) {
//   try {
//     const url = new URL(value);
//     return url.protocol === "http:" || url.protocol === "https:";
//   } catch {
//     return false;
//   }
// }

// function makeCode() {
//   return crypto.randomBytes(5).toString("base64url").slice(0, 7).toLowerCase();
// }

// router.get("/check-alias", requireAuth, async (req, res, next) => {
//   try {
//     const alias = String(req.query.alias || "").trim().toLowerCase();
//     if (!alias) return res.json({ available: false, message: "Enter a custom alias." });
//     if (!ALIAS_RE.test(alias)) {
//       return res.json({ available: false, message: "Use 3–30 letters, numbers, hyphens, or underscores." });
//     }
//     const exists = await ShortUrl.exists({ code: alias });
//     res.json({ available: !exists, message: exists ? "This alias is already taken." : "This alias is available." });
//   } catch (error) {
//     next(error);
//   }
// });

// router.post("/", requireAuth, async (req, res, next) => {
//   try {
//     const originalUrl = String(req.body.originalUrl || "").trim();
//     const requestedAlias = String(req.body.alias || "").trim().toLowerCase();
//     if (!validHttpUrl(originalUrl)) {
//       return res.status(400).json({ message: "Enter a valid URL starting with http:// or https://." });
//     }

//     let code = requestedAlias;
//     if (code) {
//       if (!ALIAS_RE.test(code)) {
//         return res.status(400).json({ message: "Custom alias must be 3–30 letters, numbers, hyphens, or underscores." });
//       }
//       if (await ShortUrl.exists({ code })) {
//         return res.status(409).json({ message: "That alias was just claimed. Please choose another." });
//       }
//     } else {
//       let attempts = 0;
//       do {
//         code = makeCode();
//         attempts += 1;
//       } while (await ShortUrl.exists({ code }) && attempts < 5);
//       if (await ShortUrl.exists({ code })) return res.status(503).json({ message: "Could not create a unique short link. Try again." });
//     }

//     const link = await ShortUrl.create({ originalUrl, code, user: req.userId });
//     res.status(201).json({ link });
//   } catch (error) {
//     if (error?.code === 11000) return res.status(409).json({ message: "That short alias is already in use. Try another." });
//     next(error);
//   }
// });

// router.get("/my", requireAuth, async (req, res, next) => {
//   try {
//     const links = await ShortUrl.find({ user: req.userId }).sort({ createdAt: -1 }).lean();
//     res.json({ links });
//   } catch (error) {
//     next(error);
//   }
// });

// router.delete("/:id", requireAuth, async (req, res, next) => {
//   try {
//     const deleted = await ShortUrl.findOneAndDelete({ _id: req.params.id, user: req.userId });
//     if (!deleted) return res.status(404).json({ message: "Link not found." });
//     res.json({ message: "Link deleted." });
//   } catch (error) {
//     next(error);
//   }
// });

// export default router;

import { Router } from "express";
import crypto from "node:crypto";
import ShortUrl from "../models/ShortUrl.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const ALIAS_RE = /^[a-zA-Z0-9_-]{3,30}$/;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 50;

function getPagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const requestedLimit = Number.parseInt(query.limit, 10) || DEFAULT_LIMIT;
  const limit = Math.min(MAX_LIMIT, Math.max(1, requestedLimit));

  return { page, limit, skip: (page - 1) * limit };
}

function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function makeCode() {
  return crypto.randomBytes(5).toString("base64url").slice(0, 7).toLowerCase();
}

// Check whether a custom alias is available.
router.get("/check-alias", requireAuth, async (req, res, next) => {
  try {
    const alias = String(req.query.alias || "").trim().toLowerCase();

    if (!alias) {
      return res.json({
        available: false,
        message: "Enter a custom alias."
      });
    }

    if (!ALIAS_RE.test(alias)) {
      return res.json({
        available: false,
        message: "Use 3–30 letters, numbers, hyphens, or underscores."
      });
    }

    const exists = await ShortUrl.exists({ code: alias });

    res.json({
      available: !exists,
      message: exists
        ? "This alias is already taken."
        : "This alias is available."
    });
  } catch (error) {
    next(error);
  }
});

// Create a short URL.
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const originalUrl = String(req.body.originalUrl || "").trim();
    const requestedAlias = String(req.body.alias || "")
      .trim()
      .toLowerCase();

    if (!validHttpUrl(originalUrl)) {
      return res.status(400).json({
        message: "Enter a valid URL starting with http:// or https://."
      });
    }

    let code = requestedAlias;

    if (code) {
      if (!ALIAS_RE.test(code)) {
        return res.status(400).json({
          message:
            "Custom alias must be 3–30 letters, numbers, hyphens, or underscores."
        });
      }

      if (await ShortUrl.exists({ code })) {
        return res.status(409).json({
          message: "That alias is already taken. Choose another."
        });
      }
    } else {
      let attempts = 0;

      do {
        code = makeCode();
        attempts++;
      } while (await ShortUrl.exists({ code }) && attempts < 5);

      if (await ShortUrl.exists({ code })) {
        return res.status(503).json({
          message: "Could not create a unique short link. Try again."
        });
      }
    }

    const link = await ShortUrl.create({
      originalUrl,
      code,
      user: req.userId
    });

    res.status(201).json({ link });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "That short alias is already in use. Try another."
      });
    }

    next(error);
  }
});

// GLOBAL LINKS: latest links created by all users, with pagination.
router.get("/public", async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [links, total] = await Promise.all([
      ShortUrl.find({})
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .select("originalUrl code clicks createdAt")
        .lean(),

      ShortUrl.countDocuments({})
    ]);

    res.json({
      links,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// YOUR LINKS: only the logged-in user's links, with pagination.
router.get("/my", requireAuth, async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { user: req.userId };

    const [links, total] = await Promise.all([
      ShortUrl.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      ShortUrl.countDocuments(filter)
    ]);

    res.json({
      links,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete only a link belonging to the logged-in user.
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const deleted = await ShortUrl.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!deleted) {
      return res.status(404).json({ message: "Link not found." });
    }

    res.json({ message: "Link deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;
