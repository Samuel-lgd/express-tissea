const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 6) POST - /api/users/signup
exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'Utilisateur créé', userId: newUser._id });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// 7) POST - /api/users/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({ message: 'Connecté', token });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};
