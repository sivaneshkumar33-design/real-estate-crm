const pool = require('../config/db');

const getBookings = async (req, res) => {

    try {

        const [rows] = await pool.query(`
            SELECT
                b.id,
                b.booking_date,
                b.amount,
                b.status,

                l.id AS lead_id,
                l.name AS lead_name,
                l.phone AS lead_phone,

                u.id AS unit_id,
                u.unit_number,
                u.price,

                p.id AS property_id,
                p.name AS property_name,

                creator.name AS created_by_name

            FROM bookings b

            INNER JOIN leads l
                ON b.lead_id = l.id

            INNER JOIN property_units u
                ON b.unit_id = u.id

            INNER JOIN properties p
                ON u.property_id = p.id

            INNER JOIN users creator
                ON b.created_by = creator.id

            ORDER BY b.created_at DESC
        `);

        res.json({
            success: true,
            data: rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
};



const createBooking = async (req, res) => {

    const connection = await pool.getConnection();

    try {

        const {
            lead_id,
            unit_id,
            booking_date,
            amount
        } = req.body;

        if (!lead_id || !unit_id || !booking_date) {

            return res.status(400).json({
                success: false,
                message: 'Lead, unit and booking date are required'
            });
        }

        await connection.beginTransaction();


        const [units] = await connection.query(
            `
            SELECT *
            FROM property_units
            WHERE id = ?
            FOR UPDATE
            `,
            [unit_id]
        );


        if (units.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: 'Property unit not found'
            });
        }


        const unit = units[0];


        if (unit.availability !== 'AVAILABLE') {

            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: 'This unit is already booked'
            });
        }



        const [leads] = await connection.query(
            `
            SELECT *
            FROM leads
            WHERE id = ?
            `,
            [lead_id]
        );


        if (leads.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }



        const [booking] = await connection.query(
            `
            INSERT INTO bookings
            (
                lead_id,
                unit_id,
                booking_date,
                amount,
                status,
                created_by
            )
            VALUES (?, ?, ?, ?, 'CONFIRMED', ?)
            `,
            [
                lead_id,
                unit_id,
                booking_date,
                amount || 0,
                req.user.id
            ]
        );


        await connection.query(
            `
            UPDATE property_units
            SET availability = 'BOOKED'
            WHERE id = ?
            `,
            [unit_id]
        );


        await connection.query(
            `
            UPDATE leads
            SET stage = 'BOOKED'
            WHERE id = ?
            `,
            [lead_id]
        );


        await connection.commit();


        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                id: booking.insertId
            }
        });


    } catch (error) {

        await connection.rollback();

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to create booking'
        });

    } finally {

        connection.release();
    }
};


const cancelBooking = async (req, res) => {

    const connection = await pool.getConnection();

    try {

        const { id } = req.params;

        await connection.beginTransaction();


        const [bookings] = await connection.query(
            `
            SELECT *
            FROM bookings
            WHERE id = ?
            FOR UPDATE
            `,
            [id]
        );


        if (bookings.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }


        const booking = bookings[0];


        if (booking.status === 'CANCELLED') {

            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: 'Booking already cancelled'
            });
        }


        await connection.query(
            `
            UPDATE bookings
            SET status = 'CANCELLED'
            WHERE id = ?
            `,
            [id]
        );


        await connection.query(
            `
            UPDATE property_units
            SET availability = 'AVAILABLE'
            WHERE id = ?
            `,
            [booking.unit_id]
        );


        await connection.commit();


        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });


    } catch (error) {

        await connection.rollback();

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking'
        });

    } finally {

        connection.release();
    }
};


module.exports = {
    getBookings,
    createBooking,
    cancelBooking
};