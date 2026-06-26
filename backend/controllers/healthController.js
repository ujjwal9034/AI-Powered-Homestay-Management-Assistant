/**
 * Health Controller
 * Returns server health status.
 */

const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StayWise API is running',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
};

module.exports = { getHealth };
