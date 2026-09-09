const db = require('../config/db');

exports.getLeads = async (req, res) => {
    try {
        const { search, stage, assigned_to } = req.query;

        let sql = `
            SELECT
                l.*,
                u.name AS assigned_user_name
            FROM leads l
            LEFT JOIN users u
                ON l.assigned_to = u.id
            WHERE 1 = 1
        `;

        const params = [];

        if (search) {
            sql += `
                AND (
                    l.name LIKE ?
                    OR l.phone LIKE ?
                    OR l.email LIKE ?
                )
            `;

            const searchValue = `%${search}%`;

            params.push(
                searchValue,
                searchValue,
                searchValue
            );
        }

        if (stage) {
            sql += ` AND l.stage = ?`;
            params.push(stage);
        }

        if (assigned_to) {
            sql += ` AND l.assigned_to = ?`;
            params.push(assigned_to);
        }

        if (req.user && req.user.role === 'SALES') {
            sql += ` AND l.assigned_to = ?`;
            params.push(req.user.id);
        }

        sql += ` ORDER BY l.created_at DESC`;

        const [rows] = await db.query(sql, params);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch leads'
        });
    }
};


exports.getLeadById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            `
            SELECT
                l.*,
                u.name AS assigned_user_name
            FROM leads l
            LEFT JOIN users u
                ON l.assigned_to = u.id
            WHERE l.id = ?
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        if (
            req.user.role === 'SALES' &&
            rows[0].assigned_to !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch lead'
        });
    }
};


exports.createLead = async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            source,
            stage,
            assigned_to,
            notes,
            follow_up_date
        } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name and phone are required'
            });
        }

        const leadStage = stage || 'NEW';

        const [result] = await db.query(
            `
            INSERT INTO leads
            (
                name,
                phone,
                email,
                source,
                stage,
                assigned_to,
                notes,
                follow_up_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                name,
                phone,
                email || null,
                source || null,
                leadStage,
                assigned_to || null,
                notes || null,
                follow_up_date || null
            ]
        );

        const [newLead] = await db.query(
            `
            SELECT
                l.*,
                u.name AS assigned_user_name
            FROM leads l
            LEFT JOIN users u
                ON l.assigned_to = u.id
            WHERE l.id = ?
            `,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Lead created successfully',
            data: newLead[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to create lead'
        });
    }
};


exports.updateLead = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            phone,
            email,
            source,
            stage,
            assigned_to,
            notes,
            follow_up_date
        } = req.body;

        // Check lead
        const [existing] = await db.query(
            `SELECT * FROM leads WHERE id = ?`,
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        if (
            req.user.role === 'SALES' &&
            existing[0].assigned_to !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission'
            });
        }

        await db.query(
            `
            UPDATE leads
            SET
                name = ?,
                phone = ?,
                email = ?,
                source = ?,
                stage = ?,
                assigned_to = ?,
                notes = ?,
                follow_up_date = ?
            WHERE id = ?
            `,
            [
                name,
                phone,
                email || null,
                source || null,
                stage || 'NEW',
                assigned_to || null,
                notes || null,
                follow_up_date || null,
                id
            ]
        );

        const [updatedLead] = await db.query(
            `
            SELECT
                l.*,
                u.name AS assigned_user_name
            FROM leads l
            LEFT JOIN users u
                ON l.assigned_to = u.id
            WHERE l.id = ?
            `,
            [id]
        );

        res.json({
            success: true,
            message: 'Lead updated successfully',
            data: updatedLead[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to update lead'
        });
    }
};


exports.deleteLead = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can delete leads'
            });
        }

        const [result] = await db.query(
            `DELETE FROM leads WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        res.json({
            success: true,
            message: 'Lead deleted successfully'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to delete lead'
        });
    }
};