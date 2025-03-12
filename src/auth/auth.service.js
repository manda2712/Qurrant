const jwt = require('jsonwebtoken')

const bcrypt = require('bcrypt');

const userRepository = require('./auth.repository');

function generateToken(user) {
    return jwt.sign({userId: user.id, username:user.username, email: user.email, role: user.role}, process.env.JWT_SECRET, {expiresIn: '7d'})
}

async function register(username, email, password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            username,
            email,
            password: hashedPassword,
            role: "User",
        };
        const newUser = await userRepository.createUser(user);
        return newUser
    } catch (error) {
        throw new Error("Gagal dalam membuat akun :("); 
    }
    
}

async function login(username, password) {
    const user = await userRepository.findUserByUsername(username)

    if (!user) {
        throw new Error("Username Tidak Cocok");    
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
        throw new Error("Password Tidak Cocok");    
    }

    const token = generateToken(user)
    return {user, token} 
    
}

module.exports = {
    register,
    login
}