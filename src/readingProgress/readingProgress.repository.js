

const prisma = require("../db");

async function createProgress(progressData) {
    try {
        // 1️⃣ Cek apakah juz sudah dipilih oleh orang lain dan masih aktif
        const existingJuz = await prisma.readingProgress.findFirst({
            where: { 
                juz: progressData.juz,
                isReading: true // Pastikan hanya progress aktif yang dicek
            }
        });

        if (existingJuz) {
            throw new Error("Juz ini sudah dipilih oleh orang lain!");
        }

        // 2️⃣ Cek apakah user sudah memiliki progress aktif
        const userHasProgress = await prisma.readingProgress.findFirst({
            where: { 
                userId: progressData.userId,
                isReading: true // Hanya cek progress yang masih aktif
            }
        });

        if (userHasProgress) {
            throw new Error("Setiap user hanya bisa memiliki satu progress aktif!");
        }

        // 3️⃣ Jika lolos validasi, buat progress baru
        const newProgress = await prisma.readingProgress.create({ data: progressData });
        return newProgress;
    } catch (error) {
        throw new Error("Gagal menambahkan progress membaca: " + error.message);
    }
}

async function findJuzProgress(userId, juz) {
    return prisma.readingProgress.findFirst({
        where: {
            userId: userId,
            juz,
        }
    });
}



async function findAllUserProgress() {
    const readingProgress = await prisma.readingProgress.findMany({
        select: {
            id: true,
            userId: true,
            juz: true,
            surah: true,
            catatan: true,
            status: true,
            user: {
                select: { username: true }
            }
        },
    });
    return readingProgress;
}

async function findProgressByUserId(userId) {
    return prisma.readingProgress.findMany({
        where: { userId: parseInt(userId) },
        select: {
            id: true,
            juz: true,
            surah: true,
            catatan: true,
            status: true,
            createdAt: true,
            user: {
                select: { username: true }
            }
        }
    });
}

async function findActiveReadingUsers() {
    return prisma.readingProgress.findMany({
        where: { status: "Sedang_dilakukan" },
        select: {
            id: true,
            user: {
                select: { id: true, username: true, email: true }
            },
            juz: true,
            surah: true,
            catatan: true,
            createdAt: true
        }
    });
}

async function findProgressById(progressId) {
    try {
        return await prisma.readingProgress.findUnique({
            where: { id: parseInt(progressId) }
        });
    } catch (error) {
        throw new Error("Gagal mengambil progress membaca: " + error.message);
    }
}


async function updateProgressStatus(progressId, status) {
    try {
        if (!progressId || isNaN(progressId)) {
            console.error("❌ progressId tidak valid:", progressId);
            throw new Error("ID progress tidak valid.");
        }

        console.log("📌 Status diterima di backend:", status);
        
        const normalizedStatus = status.toLowerCase();
        const isReading = normalizedStatus === "sedang_dilakukan"; 

        // Cek apakah progress ID ada di database
        const existingProgress = await prisma.readingProgress.findUnique({
            where: { id: parseInt(progressId, 10) }
        });

        if (!existingProgress) {
            console.error("🚨 Progress dengan ID ini tidak ditemukan:", progressId);
            throw new Error("Progress tidak ditemukan.");
        }

        // Cek apakah status yang dikirim berbeda dari yang ada di database
        if (existingProgress.status === status) {
            console.log("🚨 Status sama, tidak ada perubahan.");
            return existingProgress;
        }

        console.log("📢 Akan mengupdate status:", { status, isReading });

        // Update ke database
        const updatedProgress = await prisma.readingProgress.update({
            where: { id: parseInt(progressId, 10) },
            data: { isReading, status },
        });

        console.log("✅ Setelah update:", updatedProgress);
        return updatedProgress;
    } catch (error) {
        console.error("❌ Gagal memperbarui status progress:", error.message);
        throw new Error("Gagal memperbarui status progress: " + error.message);
    }
}


async function deleteProgress(progressId) {
    try {
        const id = parseInt(progressId);

        // Cek apakah progress ada di database sebelum menghapus
        const existingProgress = await prisma.readingProgress.findUnique({ where: { id } });

        if (!existingProgress) {
            console.log("Progress dengan ID", id, "tidak ditemukan.");
            return null;
        }

        // Hapus progress
        const deletedProgress = await prisma.readingProgress.delete({ where: { id } });
        console.log("Progress dengan ID", id, "berhasil dihapus.");
        return deletedProgress;
    } catch (error) {
        console.error("Error saat menghapus progress:", error.message);
        throw new Error("Gagal menghapus progress membaca: " + error.message);
    }
}

async function deleteAllProgress() {
    try {
        const deletedCount = await prisma.readingProgress.deleteMany();
        return { message: "Semua progress membaca berhasil dihapus!", deleted: deletedCount.count };
    } catch (error) {
        throw new Error("Gagal menghapus semua progress: " + error.message);
    }
}


module.exports = { 
    createProgress, 
    findJuzProgress,
    findAllUserProgress,
    findProgressByUserId, 
    findProgressById,
    findActiveReadingUsers,
    updateProgressStatus, 
    deleteProgress ,
    deleteAllProgress
};

