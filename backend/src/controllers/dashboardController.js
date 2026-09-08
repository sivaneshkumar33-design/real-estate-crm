const pool = require('../config/db');

const getDashboard = async (req, res) => {

    try {

        const isSales = req.user && req.user.role === 'SALES';
        const leadCondition = isSales ? 'WHERE assigned_to = ?' : '';
        const leadParams = isSales ? [req.user.id] : [];

        const [leadStats] = await pool.query(`
            SELECT
                COUNT(*) AS total_leads,

                COALESCE(SUM(stage = 'NEW'), 0) AS new_leads,

                COALESCE(SUM(stage = 'SITE_VISIT'), 0) AS site_visits,

                COALESCE(SUM(stage = 'BOOKED'), 0) AS booked_leads

            FROM leads
            ${leadCondition}
        `, leadParams);


        const bookingCondition = isSales ? 'WHERE created_by = ?' : '';
        const bookingParams = isSales ? [req.user.id] : [];

        const [bookingStats] = await pool.query(`
            SELECT
                COUNT(*) AS total_bookings,

                COALESCE(
                    SUM(
                        CASE
                            WHEN status = 'CONFIRMED'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_amount

            FROM bookings
            ${bookingCondition}
        `, bookingParams);


        const followUpCondition = isSales ? 'AND assigned_to = ?' : '';
        const followUpParams = isSales ? [req.user.id] : [];

        const [followUps] = await pool.query(`
            SELECT
                COUNT(*) AS upcoming_followups

            FROM leads

            WHERE follow_up_date IS NOT NULL

            AND follow_up_date >= CURDATE()

            AND follow_up_date <= DATE_ADD(
                CURDATE(),
                INTERVAL 7 DAY
            )

            AND stage NOT IN ('BOOKED', 'LOST')
            ${followUpCondition}
        `, followUpParams);

        res.json({
            success: true,
            data: {
                leads: leadStats[0],
                bookings: bookingStats[0],
                followUps: followUps[0]
            }
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Failed to load dashboard'
        });
    }
};

module.exports = {
    getDashboard
};