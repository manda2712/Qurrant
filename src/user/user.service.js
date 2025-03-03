const bcrypt = require("bcrypt")

const { insertUser, findUser, findUserById, findActiveUsers,editUser, deleteUser } = require("./user.repository");

async function createUser(newUserData) {
    const hashedPassword = await bcrypt.hash(newUserData.password, 10)

    newUserData.password = hashedPassword
    const  newUser = await insertUser(newUserData);  
    return newUser  
}

async function getAllUser() {
    const user = findUser();
    return user   
}

async function getUserById(id) {
    const user = await findUserById(id)
    if (!user) {
        throw new Error("cannot find user");
    }
    return user;   
}

async function getActiveUsers() { // ✅ Fungsi untuk mengambil user yang sedang membaca
    const users = await findActiveUsers();
    return users;
}

async function editUserById(id, userData) {
    if(userData.password){
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;
    }
    await getUserById(id);
    const updateUser = await editUser(id, userData)
    return updateUser;  
}

async function deleteUserById(id) {
    const user = await getUserById(id);

    if (!user) {
        throw new Error("User not found"); // Jangan lanjut jika user tidak ada
    }

    return await deleteUser(id);
}


module.exports = {
    createUser,
    getAllUser,
    getUserById,
    getActiveUsers,
    editUserById,
    deleteUserById
}