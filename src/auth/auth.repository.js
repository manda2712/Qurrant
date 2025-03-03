const prisma = require("../db");

async function createUser(user) {
    try {
        const newUser = await prisma.user.create({
            data: user // Langsung gunakan user, bukan user.data
        });
        return newUser;
    } catch (error) {
        console.error("Error saat membuat user:", error.message); // Logging error agar lebih jelas
        throw new Error("Gagal membuat akun, silakan coba lagi.");
    }  
}

async function findUserByUsername(username) {
    return await prisma.user.findUnique({
        where: { username }
    });
}

module.exports = {
    createUser,
    findUserByUsername
};
