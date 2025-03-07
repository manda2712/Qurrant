
const express = require("express");
const router = express.Router();
const readingProgressService = require("./readingProgress.service");
const authorizeJWT = require("../middleware/authorizeJWT");
const authorizationAdmin = require("../middleware/adminAuthorization");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/progress", authorizeJWT, async (req, res) => {
    try {
        const { juz, surah, catatan, status } = req.body;
        const userIdFromToken = req.user.userId;

        if (!juz || !surah || !catatan || !status) {
            return res.status(400).json({ message: "Semua field wajib diisi!" });
        }

        // 🛠️ Normalisasi format status agar konsisten
        const statusFormatted = status.toLowerCase().trim(); // Pastikan status tidak ada spasi & huruf kecil dulu
        const validStatus = {
            "belum dibaca": "belum_dibaca",
            "sedang dilakukan": "Sedang_dilakukan",
            "selesai": "Selesai"
        };

        // Cek apakah status yang dikirim valid
        if (!validStatus[statusFormatted]) {
            return res.status(400).json({ 
                message: `Status tidak valid! Harus salah satu dari: ${Object.keys(validStatus).join(", ")}` 
            });
        }

        console.log("🟢 User ID dari token:", userIdFromToken);
        console.log("🔍 Mengecek apakah progress sudah ada untuk surah ini...");

        // Cari progress berdasarkan user, juz, dan surah
        const existingProgress = await prisma.readingProgress.findFirst({
            where: {
                userId: userIdFromToken,
                juz,
                surah,
            },
        });

        if (existingProgress) {
            console.log("⚠️ Progress untuk surah ini sudah ada! Mengupdate status...");

            const updatedProgress = await prisma.readingProgress.update({
                where: { id: existingProgress.id },
                data: { status: validStatus[statusFormatted], catatan }
            });

            return res.status(200).json({ 
                message: "Progress diperbarui!", 
                data: updatedProgress 
            });
        }

        console.log("🚀 Belum ada progress untuk surah ini, membuat progress baru...");
        
        const newProgress = await prisma.readingProgress.create({
            data: {
                userId: userIdFromToken,
                juz,
                surah,
                catatan,
                status: validStatus[statusFormatted], // Simpan status dengan format yang benar
            },
        });

        res.status(201).json({ 
            message: "Progress berhasil ditambahkan!", 
            data: newProgress 
        });
    } catch (error) {
        console.error("❌ Error saat menambahkan atau memperbarui progress:", error);
        res.status(500).json({ message: "Gagal menambahkan atau memperbarui progress" });
    }
});

router.get("/", async (req, res) => {
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





// ✅ Ambil progress membaca berdasarkan userId (hanya user sendiri atau admin)
// router.get("/progress/:userId", authorizeJWT, async (req, res) => {
//     try {
//         const userId = parseInt(req.params.userId);
//         console.log("User ID dari token:", req.user.userId, "| User ID yang diminta:", userId);

//         // Cegah user melihat progress orang lain kecuali admin
//         if (req.user.role !== "admin" && req.user.userId !== userId) {
//             return res.status(403).json({ message: "Anda tidak diizinkan melihat progress orang lain!" });
//         }

//         const progress = await readingProgressService.getUserReadingProgress(userId);
//         console.log("📜 Data progress yang dikirim ke frontend:", progress);
//         if (!progress.length) {
//             return res.status(404).json({ message: "Tidak ada progress membaca untuk user ini" });
//         }

//         res.status(200).json({ data: progress, message: "Progress berhasil diambil!" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// router.put("/progress/:id", authorizeJWT, async (req, res) => {
//     try {
//         const progressId = parseInt(req.params.id);
//         const { status } = req.body; // Status bisa: "belum dibaca", "sedang dilakukan", atau "selesai"
        
//         if (!status) {
//             return res.status(400).json({ message: "Status wajib diisi!" });
//         }

//         // Cari progress berdasarkan ID
//         const existingProgress = await prisma.readingProgress.findUnique({
//             where: { id: progressId }
//         });

//         if (!existingProgress) {
//             return res.status(404).json({ message: "Progress tidak ditemukan!" });
//         }

//         // Pastikan hanya pemilik atau admin yang bisa update
//         if (req.user.role !== "admin" && req.user.userId !== existingProgress.userId) {
//             return res.status(403).json({ message: "Anda tidak diizinkan mengubah progress orang lain!" });
//         }

//         // Update progress
//         const updatedProgress = await prisma.readingProgress.update({
//             where: { id: progressId },
//             data: { status }
//         });

//         res.status(200).json({ message: "Progress berhasil diperbarui!", data: updatedProgress });
//     } catch (error) {
//         console.error("❌ Error saat memperbarui progress:", error);
//         res.status(500).json({ message: "Gagal memperbarui progress" });
//     }
// });



router.put("/progress/:id", async (req, res) => {
    try {
        const progressId = parseInt(req.params.id);
        console.log("🆔 Menerima update untuk Progress ID:", progressId);

        if (isNaN(progressId)) {
            console.error("⚠ ID progress tidak valid!");
            return res.status(400).json({ message: "ID progress tidak valid!" });
        }

        // Ambil progress dari database
        const progress = await readingProgressService.getProgressById(progressId);
        console.log("📄 Data progress dari DB:", progress);

        if (!progress) {
            console.error("⚠ Progress tidak ditemukan di database!");
            return res.status(404).json({ message: "Progress tidak ditemukan!" });
        }

        console.log("✅ Data sebelum update:", progress);
        console.log("🆕 Data baru dari FE:", req.body);

        // Pastikan status sesuai ENUM
        const statusFormatted = req.body.status?.toUpperCase().trim();
        const validStatus = [belum_dibaca, Sedang_dilakukan,Selesai];

        if (statusFormatted && !validStatus.includes(statusFormatted)) {
            return res.status(400).json({ 
                message: `Status tidak valid! Harus salah satu dari: ${validStatus.join(", ")}` 
            });
        }

        // Tentukan nilai isReading berdasarkan status
        let isReading = progress.isReading; // Default dari data lama

        if (statusFormatted === "Sedang_dilakukan") {
            isReading = true;
        } else if (statusFormatted === "Selesai") {
            isReading = false;
        }

        // Update data di database
        const updatedProgress = await prisma.readingProgress.update({
            where: { id: progressId },
            data: {
                status: statusFormatted || progress.status,
                surah: req.body.surah || progress.surah,
                catatan: req.body.catatan || progress.catatan,
                isReading: isReading, // Update isReading sesuai status
            },
        });

        console.log("✅ Data setelah update:", updatedProgress);
        res.json({ message: "Progress berhasil diperbarui", data: updatedProgress });

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
