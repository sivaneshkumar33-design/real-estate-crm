const pool = require('../config/db');

const getSalesUsers = async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT id, name, email, role
            FROM users
            WHERE role = 'SALES'
            ORDER BY name
        `);

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch sales users'
        });
    }
};

module.exports = {
    getSalesUsers
};