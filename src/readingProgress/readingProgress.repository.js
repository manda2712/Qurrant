const prisma = require("../db");

async function createProgress(progressData) {
    try {
        const newProgress = await prisma.readingProgress.create({ data: progressData });
        return newProgress;
    } catch (error) {
        throw new Error("Gagal menambahkan progress membaca di repository: " + error.message);
    }
}

async function findProgressByUserId(userId) {
    return prisma.readingProgress.findMany({ where: { userId: parseInt(userId) } });
}

async function findActiveReadingUsers() {
    return prisma.readingProgress.findMany({
        where: { status: "Sedang_dilakukan" }, // Hanya user yang sedang membaca
        select: {
            id: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            },
            juz: true,
            surah: true,
            ayat: true,
            catatan: true,
            createdAt: true
        }
    });
}

// ✅ Perbaikan: Gunakan Prisma findUnique, bukan findByPk (Sequelize)
async function findProgressById(progressId) {
    try {
        const progress = await prisma.readingProgress.findUnique({
            where: { id: parseInt(progressId) }
        });

        return progress;
    } catch (error) {
        throw new Error("Gagal mengambil progress membaca: " + error.message);
    }
}

async function updateProgressStatus(progressId, status) {
    try {
        const isReading = status === "Sedang_dilakukan"; // Jika sedang dilakukan, aktif (true), jika selesai, nonaktif (false
        const updatedProgress = await prisma.readingProgress.update({
            where: { id: parseInt(progressId) },
            data: { status, isReading },
        });

        return updatedProgress;
    } catch (error) {
        throw new Error("Gagal memperbarui status progress: " + error.message);
    }
}

// async function updateProgressStatus(progressId, status, catatan = null) {
//     try {
//         const updateData = { status }; // Awalnya hanya status yang diperbarui

//         if (catatan !== null) { // Jika ada catatan baru, tambahkan ke updateData
//             updateData.catatan = catatan;
//         }

//         const updatedProgress = await prisma.readingProgress.update({
//             where: { id: parseInt(progressId) },
//             data: updateData,
//         });

//         return updatedProgress;
//     } catch (error) {
//         throw new Error("Gagal memperbarui status progress: " + error.message);
//     }
// }


// async function deleteProgress(progressId) {
//     try {
//         await prisma.readingProgress.delete({ where: { id: parseInt(progressId) } });
//     } catch (error) {
//         throw new Error("Gagal menghapus progress membaca di repository: " + error.message);
//     }
// }
async function deleteProgress(progressId) {
    try {
        const id = parseInt(progressId); // Pastikan dalam format angka
        console.log("Mengecek progress dengan ID:", id);

        // Cek apakah progress ada di database sebelum menghapus
        const existingProgress = await prisma.readingProgress.findUnique({
            where: { id }
        });

        if (!existingProgress) {
            console.log("Progress dengan ID", id, "tidak ditemukan.");
            return null; // Return null jika progress tidak ditemukan
        }

        // Hapus progress
        const deletedProgress = await prisma.readingProgress.delete({ where: { id } });
        console.log("Progress dengan ID", id, "berhasil dihapus.");
        return deletedProgress; // Pastikan mengembalikan hasil penghapusan

    } catch (error) {
        console.error("Error saat menghapus progress:", error.message);
        throw new Error("Gagal menghapus progress membaca di repository: " + error.message);
    }
}



module.exports = { 
    createProgress, 
    findProgressByUserId, 
    findProgressById,
    findActiveReadingUsers,
    updateProgressStatus, 
    deleteProgress 
};
