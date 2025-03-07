const readingProgressRepository = require("./readingProgress.repository");

async function addReadingProgress(userId, juz, surah, catatan) {
    try {
        const progress = {
            userId,
            juz,
            surah,
            catatan,
            status: "Sedang_dilakukan",
            isReading: true,
        };
        console.log("📝 Data yang dikirim ke Prisma:", progress);
        return await readingProgressRepository.createProgress(progress);
    } catch (error) {
        throw new Error("Gagal menambahkan progress membaca: " + error.message);
    }
}

async function getAllUserProgress() {
    const readingProgress = await readingProgressRepository.findAllUserProgress();
    console.log("✅ Data dari Repository:", readingProgress); // Debugging
    return readingProgress;
}


async function getUserReadingProgress(userId) {
    try {
        return await readingProgressRepository.findProgressByUserId(userId);
    } catch (error) {
        throw new Error("Gagal mengambil progress membaca: " + error.message);
    }
}

// ✅ Perbaikan: find -> findProgressById
async function getProgressById(progressId) {
    try {
        return await readingProgressRepository.findProgressById(progressId);
    } catch (error) {
        console.error("Error saat mengambil progress:", error);
        throw new Error("Gagal mengambil progress: " + error.message);
    }
}

// ✅ Perbaikan: Hapus `false` pada parameter
// async function markAsComplete(progressId) {
//     try {
//         return await readingProgressRepository.updateProgressStatus(progressId, "Selesai");
//     } catch (error) {
//         throw new Error("Gagal memperbarui status progress: " + error.message);
//     }
// }

async function markAsComplete(progressId, newCatatan = null) {
    try {
        return await readingProgressRepository.updateProgressStatus(progressId, "Selesai", newCatatan);
    } catch (error) {
        throw new Error("Gagal memperbarui status progress: " + error.message);
    }
}


// ✅ Perbaikan: Ganti `findActiveUsersWithProgress` -> `findActiveReadingUsers`
async function getActiveUsersWithReadingProgress() {
    try {
        return await readingProgressRepository.findActiveReadingUsers();
    } catch (error) {
        throw new Error("Gagal mengambil daftar user yang aktif membaca: " + error.message);
    }
}

// async function removeReadingProgress(progressId) {
//     try {
//         await readingProgressRepository.deleteProgress(progressId);
//     } catch (error) {
//         throw new Error("Gagal menghapus progress membaca: " + error.message);
//     }
// }

async function removeReadingProgress(progressId) {
    try {
        const deletedProgress = await readingProgressRepository.deleteProgress(progressId);
        
        if (!deletedProgress) {
            return null; // Pastikan return null jika progress tidak ditemukan
        }

        return deletedProgress; // Return data yang berhasil dihapus
    } catch (error) {
        throw new Error("Gagal menghapus progress membaca: " + error.message);
    }
}



module.exports = { 
    addReadingProgress, 
    getAllUserProgress,
    getUserReadingProgress, 
    getProgressById,
    markAsComplete, 
    getActiveUsersWithReadingProgress,
    removeReadingProgress 
};
