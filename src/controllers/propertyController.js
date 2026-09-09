const pool = require('../config/db');


const getProperties = async (req, res) => {
    try {

        const [properties] = await pool.query(`
            SELECT
                p.id,
                p.name,
                p.location,
                p.description,
                p.created_at,
                COUNT(u.id) AS total_units,
                SUM(
                    CASE
                        WHEN u.availability = 'AVAILABLE'
                        THEN 1
                        ELSE 0
                    END
                ) AS available_units
            FROM properties p
            LEFT JOIN property_units u
                ON p.id = u.property_id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `);

        res.json({
            success: true,
            data: properties
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties'
        });
    }
};


const getProperty = async (req, res) => {

    try {

        const { id } = req.params;

        const [properties] = await pool.query(
            `SELECT * FROM properties WHERE id = ?`,
            [id]
        );

        if (properties.length === 0) {

            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        const [units] = await pool.query(
            `
            SELECT *
            FROM property_units
            WHERE property_id = ?
            ORDER BY unit_number
            `,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...properties[0],
                units
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch property'
        });
    }
};


const createProperty = async (req, res) => {

    try {

        const {
            name,
            location,
            description
        } = req.body;

        if (!name) {

            return res.status(400).json({
                success: false,
                message: 'Property name is required'
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO properties
            (name, location, description)
            VALUES (?, ?, ?)
            `,
            [
                name,
                location || null,
                description || null
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            data: {
                id: result.insertId
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to create property'
        });
    }
};


const updateProperty = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            name,
            location,
            description
        } = req.body;

        const [result] = await pool.query(
            `
            UPDATE properties
            SET
                name = ?,
                location = ?,
                description = ?
            WHERE id = ?
            `,
            [
                name,
                location || null,
                description || null,
                id
            ]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        res.json({
            success: true,
            message: 'Property updated successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to update property'
        });
    }
};


const deleteProperty = async (req, res) => {

    try {

        const { id } = req.params;

        const [result] = await pool.query(
            `DELETE FROM properties WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        res.json({
            success: true,
            message: 'Property deleted successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to delete property'
        });
    }
};


const createUnit = async (req, res) => {

    try {

        const { propertyId } = req.params;

        const {
            unit_number,
            price,
            type
        } = req.body;

        if (!unit_number || !price || !type) {

            return res.status(400).json({
                success: false,
                message: 'Unit number, price and type are required'
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO property_units
            (
                property_id,
                unit_number,
                price,
                type
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                propertyId,
                unit_number,
                price,
                type
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Unit created successfully',
            data: {
                id: result.insertId
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to create unit'
        });
    }
};


const updateUnit = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            unit_number,
            price,
            type
        } = req.body;

        const [result] = await pool.query(
            `
            UPDATE property_units
            SET
                unit_number = ?,
                price = ?,
                type = ?
            WHERE id = ?
            `,
            [
                unit_number,
                price,
                type,
                id
            ]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: 'Unit not found'
            });
        }

        res.json({
            success: true,
            message: 'Unit updated successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to update unit'
        });
    }
};


module.exports = {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    createUnit,
    updateUnit
};