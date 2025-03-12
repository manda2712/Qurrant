const express = require("express");
const router = express.Router();
const readingProgressService = require("./readingProgress.service");
const authorizeJWT = require("../middleware/authorizeJWT");
const authorizationAdmin = require("../middleware/adminAuthorization");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


router.post("/progress", authorizeJWT, async (req, res) => {
    try {
        console.log("📥 Data diterima di backend:", req.body);

        const { juz, surah, status, catatan } = req.body;
        const userId = req.user.userId; // Ambil userId dari token

        if (!juz || !surah || !status) { 
            return res.status(400).json({ message: "Semua field harus diisi!" });
        }

        const result = await readingProgressService.addReadingProgress(userId, juz, surah, catatan);

        if (!result.success) {
            return res.status(result.status || 500).json({ message: result.message });
        }

        res.status(201).json({ message: "Progress berhasil ditambahkan!", data: result.data });
    } catch (error) {
        console.error("❌ Error backend:", error);
        res.status(500).json({ message: "Gagal menambahkan progress" });
    }
});


router.get("/get/progress", async (req, res) => {
    try {
        const progress = await prisma.readingProgress.findMany({
            select: {
                juz: true,
                status: true,
                user: {
                    select: { username: true }
                }
            }
        });

        res.json(progress.map(item => ({
            juz: item.juz,
            status: item.status,
            username: item.user?.username || "Anonim"
        })));
    } catch (error) {
        console.error("Error fetching progress:", error);
        res.status(500).json({ message: "Gagal mengambil progress" });
    }
});

// Endpoint untuk mendapatkan progress berdasarkan ID
// router.get("/progress/:id", async (req, res) => {
//     try {
//         const progressId = parseInt(req.params.id);
//         console.log("🆔 Mencari progress dengan ID:", progressId);

//         if (isNaN(progressId)) {
//             return res.status(400).json({ message: "ID progress tidak valid!" });
//         }

//         // Ambil progress dari database berdasarkan ID
//         const progress = await prisma.readingProgress.findUnique({
//             where: { id: progressId },
//             select: {
//                 juz: true,
//                 status: true,
//                 surah: true,
//                 catatan: true,
//                 user: {
//                     select: { username: true }
//                 }
//             }
//         });

//         if (!progress) {
//             return res.status(404).json({ message: "Progress tidak ditemukan!" });
//         }

//         console.log("✅ Data progress:", progress);
//         res.status(200).json({
//             message: "Progress ditemukan!",
//             data: {
//                 juz: progress.juz,
//                 status: progress.status,
//                 surah: progress.surah,
//                 catatan: progress.catatan,
//                 username: progress.user?.username || "Anonim"
//             }
//         });
//     } catch (error) {
//         console.error("⚠ Error saat mengambil progress:", error.message);
//         res.status(500).json({ error: error.message });
//     }
// });

router.get("/progress/:id", async (req, res) => {
    try {
        const juzNumber = req.params.id; // Menggunakan juz sebagai parameter
        console.log("🆔 Mencari progress dengan JUZ:", juzNumber);

        if (isNaN(juzNumber)) {
            return res.status(400).json({ message: "Nomor JUZ tidak valid!" });
        }

        // Ambil progress dari database berdasarkan JUZ
        const progress = await prisma.readingProgress.findFirst({
            where: { juz: juzNumber },
            select: {
                juz: true,
                status: true,
                surah: true,
                catatan: true,
                user: {
                    select: { username: true }
                }
            }
        });

        if (!progress) {
            return res.status(404).json({ message: "Progress tidak ditemukan untuk JUZ ini!" });
        }

        console.log("✅ Data progress:", progress);
        res.status(200).json({
            message: "Progress ditemukan!",
            data: {
                juz: progress.juz,
                status: progress.status,
                surah: progress.surah,
                catatan: progress.catatan,
                username: progress.user?.username || "Anonim"
            }
        });
    } catch (error) {
        console.error("⚠ Error saat mengambil progress:", error.message);
        res.status(500).json({ error: error.message });
    }
});



router.get("/", authorizationAdmin, async (req, res) => {
    try {
        console.log("📢 GET /api/reading dipanggil");
        const readingProgress = await readingProgressService.getAllUserProgress();

        console.log("✅ Data dari Service:", readingProgress);
        res.status(200).json(readingProgress);
    } catch (error) {
        console.error("❌ Error di Controller:", error);
        res.status(500).json({ message: error.message });
    }
});



// router.put("/progress/:id", async (req, res) => {
//     try {
//         const progressId = parseInt(req.params.id);
//         console.log("🆔 Menerima update untuk Progress ID:", progressId);

//         if (isNaN(progressId)) {
//             return res.status(400).json({ message: "ID progress tidak valid!" });
//         }

//         // Ambil progress dari database
//         const progress = await readingProgressService.getProgressById(progressId);
//         if (!progress) {
//             return res.status(404).json({ message: "Progress tidak ditemukan!" });
//         }

//         console.log("✅ Data sebelum update:", progress);
//         console.log("🆕 Data baru dari FE:", req.body);

//         // **Perbaiki daftar ENUM status**
//         const validStatus = ["belum_dibaca", "Sedang_dilakukan", "Selesai"];
//         let statusFormatted = req.body.status?.trim();

//         if (statusFormatted && !validStatus.includes(statusFormatted)) {
//             return res.status(400).json({ 
//                 message: `Status tidak valid! Harus salah satu dari: ${validStatus.join(", ")}` 
//             });
//         }

//         // **Tentukan nilai isReading berdasarkan status**
//         let isReading = progress.isReading; 
//         if (statusFormatted === "Sedang_dilakukan") isReading = true;
//         if (statusFormatted === "Selesai") isReading = false;

//         // **Update progress**
//         const updatedProgress = await prisma.readingProgress.update({
//             where: { id: progressId },
//             data: {
//                 status: statusFormatted || progress.status,
//                 surah: req.body.surah || progress.surah,
//                 catatan: req.body.catatan || progress.catatan,
//                 isReading: isReading
//             }
//         });

//         console.log("✅ Data setelah update:", updatedProgress);
//         res.json({ message: "Progress berhasil diperbarui", data: updatedProgress });

//     } catch (error) {
//         console.error("⚠ Error di backend:", error.message);
//         res.status(500).json({ error: error.message });
//     }
// });

router.put("/progress/:juz", async (req, res) => {
    try {
        const juz = req.params.juz.trim(); // Ambil juz dari URL (string)
        console.log("🆔 Menerima update untuk Juz:", juz);

        // Cek apakah juz valid
        if (!juz) {
            return res.status(400).json({ message: "Juz tidak boleh kosong!" });
        }

        // Cek apakah progress dengan juz tersebut ada
        const progress = await prisma.readingProgress.findFirst({
            where: { juz: juz }
        });

        if (!progress) {
            return res.status(404).json({ message: "Progress tidak ditemukan untuk Juz ini!" });
        }

        console.log("✅ Data sebelum update:", progress);
        console.log("🆕 Data baru dari FE:", req.body);

        // Perbaiki daftar ENUM status
        const validStatus = ["belum_dibaca", "Sedang_dilakukan", "Selesai"];
        let statusFormatted = req.body.status?.trim();

        if (statusFormatted && !validStatus.includes(statusFormatted)) {
            return res.status(400).json({ 
                message: `Status tidak valid! Harus salah satu dari: ${validStatus.join(", ")}` 
            });
        }

        // Tentukan nilai isReading berdasarkan status
        let isReading = progress.isReading;
        if (statusFormatted === "Sedang_dilakukan") isReading = true;
        if (statusFormatted === "Selesai") isReading = false;

        // **Update progress berdasarkan juz**
        const updatedProgress = await prisma.readingProgress.updateMany({
            where: { juz: juz },
            data: {
                status: statusFormatted || progress.status,
                surah: req.body.surah || progress.surah,
                catatan: req.body.catatan || progress.catatan,
                isReading: isReading
            }
        });

        console.log("✅ Data setelah update:", updatedProgress);
        res.json({ message: "Progress berhasil diperbarui berdasarkan Juz", data: updatedProgress });

    } catch (error) {
        console.error("⚠ Error di backend:", error.message);
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

router.delete("/progress", async (req, res) => {
    try {
        const deletedData = await readingProgressService.removeAllReadingProgress();

        if (!deletedData) {
            return res.status(404).json({ message: "Tidak ada progress yang dihapus!" });
        }

        res.json({ message: "Semua progress berhasil dihapus!", deletedCount: deletedData.count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;
