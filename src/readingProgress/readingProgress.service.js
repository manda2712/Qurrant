const readingProgressRepository = require("./readingProgress.repository");

async function addReadingProgress(userId, juz, surah, catatan) {
    try {
        // Pastikan userId adalah Number
        userId = Number(userId);
        if (isNaN(userId)) {
            return { success: false, message: "User ID tidak valid!", status: 400 };
        }

        // Pastikan juz tetap string
        juz = String(juz);

        // Validasi juz harus angka antara 1-30
        if (isNaN(Number(juz)) || Number(juz) < 1 || Number(juz) > 30) {
            return { success: false, message: "Juz harus berupa angka antara 1-30!", status: 400 };
        }

        // // Cek apakah juz sudah dipilih oleh user lain
        // const isJuzTaken = await readingProgressRepository.findJuzProgress(userId, juz);
        // if (isJuzTaken) {
        //     return { success: false, message: "Juz ini sudah dipilih oleh orang lain!", status: 400 };
        // }

        // Buat progress baru jika semua validasi lolos
        const progress = {
            userId,
            juz,
            surah,
            catatan,
            status: "Sedang_dilakukan",
            isReading: true,
        };

        console.log("📝 Data yang dikirim ke Prisma:", progress);
        const createdProgress = await readingProgressRepository.createProgress(progress);

        return { success: true, message: "Progress berhasil ditambahkan!", data: createdProgress };
    } catch (error) {
        console.error("🔥 Error di addReadingProgress:", error.message);
        return { success: false, message: error.message, status: 500 };
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


async function markAsComplete(progressId, newCatatan = null) {
    try {
        const updatedProgress = await readingProgressRepository.updateProgressStatus(progressId, "Selesai");

        // Jika ada catatan baru, update catatan
        if (newCatatan) {
            await readingProgressRepository.updateProgressStatus(progressId, "Selesai", newCatatan);
        }

        return updatedProgress;
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

async function removeAllReadingProgress() {
    try {
        const deletedData = await readingProgressRepository.deleteAllProgress();

        if (deletedData.count === 0) {
            return null; // Jika tidak ada data yang dihapus
        }

        return deletedData; // Kembalikan jumlah data yang dihapus
    } catch (error) {
        throw new Error("Gagal menghapus semua progress membaca: " + error.message);
    }
}



module.exports = { 
    addReadingProgress, 
    getAllUserProgress,
    getUserReadingProgress, 
    getProgressById,
    markAsComplete, 
    getActiveUsersWithReadingProgress,
    removeReadingProgress,
    removeAllReadingProgress
};
