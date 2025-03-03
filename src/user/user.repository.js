const prisma = require("../db");

async function insertUser(userData) {
    const newUser = await prisma.user.create({
        data : {
            username : userData.username,
            email : userData.email,
            password : userData.password,
            role : userData.role
        }
    });
    return newUser   
}

async function findUser() {
    const user = await prisma.user.findMany({
        select: {
            id: true,
            username : true,
            email : true,
            role : true,
        }
    });
    return user   
}

async function findUserById(id) {
    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(id),
        },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            readingProgress: { // ✅ Menambahkan informasi bacaan user
                select: {
                    juz: true,
                    surah: true,
                    ayat: true,
                    catatan: true,
                    status: true,
                    isReading: true
                }
            }
        }
    });
    return user;
}

async function findActiveUsers() { // ✅ Fungsi untuk mendapatkan user yang sedang membaca
    const users = await prisma.user.findMany({
        where: {
            readingProgress: {
                some: { isReading: true } // Hanya user yang sedang membaca
            }
        },
        select: {
            id: true,
            username: true,
            email: true,
            readingProgress: {
                where: { isReading: true },
                select: {
                    juz: true,
                    surah: true,
                    ayat: true,
                    catatan: true,
                    status: true
                }
            }
        }
    });
    return users;
}

async function editUser(id, userData) {
    const updateUser = await prisma.user.update({
        where: {
            id : parseInt(id),
        },
        data: {
            username: userData.username,
            email: userData.email,
            role : userData.role,
        }
    });
    return updateUser    
}

async function deleteUser(id) {
    const userId = Number(id);
    if (isNaN(userId)) {
        throw new Error("User ID tidak valid!"); // Validasi jika ID bukan angka
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        console.log("User tidak ditemukan, batal menghapus.");
        return null; // Jangan lanjut ke delete jika user tidak ditemukan
    }

    console.log("Menghapus user:", userId);
    return await prisma.user.delete({
        where: { id: userId }
    });
}



module.exports = {
    insertUser,
    findUser,
    findUserById,
    findActiveUsers,
    editUser,
    deleteUser
}