
const express = require("express");
const router = express.Router();
const readingProgressService = require("./readingProgress.service");
const authorizeJWT = require("../middleware/authorizeJWT");
const authorizationAdmin = require("../middleware/adminAuthorization");

// ✅ Tambahkan progress membaca (user harus login)
router.post("/progress", authorizeJWT, async (req, res) => {
    try {
        const { juz, surah, ayat, catatan } = req.body;
        const userIdFromToken = req.user.userId; // Ambil userId dari JWT

        // Validasi input
        if (!juz || !surah || !ayat || !catatan) {
            return res.status(400).json({ message: "Semua field wajib diisi!" });
        }

        console.log("User ID dari token:", userIdFromToken);

        // Pastikan user hanya bisa menambahkan progress untuk dirinya sendiri
        if (req.body.userId && parseInt(req.body.userId) !== userIdFromToken) {
            return res.status(403).json({ message: "Anda hanya bisa menambahkan progress untuk diri sendiri!" });
        }

        // Tambahkan progress membaca
        const progress = await readingProgressService.addReadingProgress(
            userIdFromToken, juz, surah, ayat, catatan
        );

        res.status(201).json({ 
            data: progress, 
            message: "Progress berhasil ditambahkan!" 
        });
    } catch (error) {
        console.error("Error saat menambahkan progress:", error);
        res.status(500).json({ error: "Gagal menambahkan progress" });
    }
});


// ✅ Ambil progress membaca berdasarkan userId (hanya user sendiri atau admin)
router.get("/progress/:userId", authorizeJWT, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        console.log("User ID dari token:", req.user.userId, "| User ID yang diminta:", userId);

        // Cegah user melihat progress orang lain kecuali admin
        if (req.user.role !== "admin" && req.user.userId !== userId) {
            return res.status(403).json({ message: "Anda tidak diizinkan melihat progress orang lain!" });
        }

        const progress = await readingProgressService.getUserReadingProgress(userId);
        if (!progress.length) {
            return res.status(404).json({ message: "Tidak ada progress membaca untuk user ini" });
        }

        res.status(200).json({ data: progress, message: "Progress berhasil diambil!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// ✅ Tandai progress sebagai selesai (hanya user terkait yang bisa update)
// router.put("/progress/:id", authorizeJWT, async (req, res) => {
//     try {
//         const progressId = parseInt(req.params.id);
//         console.log("Progress ID yang diminta:", progressId);
//         console.log("User Login:", req.user.userId);

//         // Ambil progress berdasarkan ID
//         const progress = await readingProgressService.getProgressById(progressId);
//         console.log("Progress dari DB:", progress);

//         if (!progress) {
//             return res.status(404).json({ message: "Progress tidak ditemukan!" });
//         }

//         if (parseInt(req.user.userId) !== parseInt(progress.userId)) {
//             return res.status(403).json({ message: "Anda hanya bisa menyelesaikan progress milik sendiri!" });
//         }

//         // Update status progress
//         const updatedProgress = await readingProgressService.markAsComplete(progressId);
//         console.log("Progress setelah update:", updatedProgress);

//         res.status(200).json({
//             data: updatedProgress,
//             message: "Progress berhasil diselesaikan!",
//         });
//     } catch (error) {
//         console.error("Error:", error.message);
//         res.status(500).json({ error: error.message });
//     }
// });


router.put("/progress/:id", authorizeJWT, async (req, res) => {
    try {
        const progressId = parseInt(req.params.id);
        const { catatan } = req.body; // Ambil catatan dari request body

        console.log("Update progress ID:", progressId);
        console.log("User Login:", req.user.userId);
        console.log("Catatan Baru:", catatan);

        // Ambil progress berdasarkan ID
        const progress = await readingProgressService.getProgressById(progressId);
        if (!progress) {
            return res.status(404).json({ message: "Progress tidak ditemukan!" });
        }

        // Cek apakah user hanya mengedit progress miliknya sendiri
        if (parseInt(req.user.userId) !== parseInt(progress.userId)) {
            return res.status(403).json({ message: "Anda hanya bisa mengedit progress milik sendiri!" });
        }

        // Update status dan catatan
        const updatedProgress = await readingProgressService.markAsComplete(progressId, catatan);

        res.status(200).json({
            data: updatedProgress,
            message: "Progress berhasil diperbarui!",
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});


// ✅ Admin bisa melihat daftar user yang sedang membaca
router.get("/active-users", authorizationAdmin, async (req, res) => {
    try {
        const activeUsers = await readingProgressService.getActiveUsersWithReadingProgress();
        if (!activeUsers.length) {
            return res.status(404).json({ message: "Tidak ada user yang sedang membaca" });
        }

        res.status(200).json({ data: activeUsers, message: "Daftar user aktif berhasil diambil!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Hapus progress membaca (hanya admin)
// router.delete("/progress/:id", authorizationAdmin, async (req, res) => {
//     try {
//         const progressId = parseInt(req.params.id);

//         const deletedProgress = await readingProgressService.removeReadingProgress(progressId);
//         if (!deletedProgress) {
//             return res.status(404).json({ message: "Progress tidak ditemukan!" });
//         }

//         res.status(200).json({ message: "Progress berhasil dihapus!" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

router.delete("/progress/:id", authorizationAdmin, async (req, res) => {
    try {
        const progressId = parseInt(req.params.id);
        console.log("ID yang akan dihapus:", progressId);

        const deletedProgress = await readingProgressService.removeReadingProgress(progressId);
        if (!deletedProgress) {
            return res.status(404).json({ message: "Progress tidak ditemukan!" });
        }

        res.status(200).json({ message: "Progress berhasil dihapus!", deletedProgress });
    } catch (error) {
        console.error("Error saat menghapus progress:", error.message);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
