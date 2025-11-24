const db = require('../db/connection');

// Volunteer login authentication
const volunteerLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [accounts] = await db.query(
      `SELECT va.*, v.VolunteerID, v.FirstName, v.LastName, v.Email, v.Phone, 
              v.Skills, v.AvailabilityStatus
       FROM VolunteerAccounts va
       JOIN Volunteers v ON va.VolunteerID = v.VolunteerID
       WHERE va.Username = ? AND va.Password = ? AND va.IsActive = TRUE`,
      [username, password]
    );

    if (accounts.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const account = accounts[0];

    // Update last login
    await db.query(
      'UPDATE VolunteerAccounts SET LastLogin = NOW() WHERE AccountID = ?',
      [account.AccountID]
    );

    res.json({
      success: true,
      volunteer: {
        accountId: account.AccountID,
        volunteerId: account.VolunteerID,
        username: account.Username,
        fullName: `${account.FirstName} ${account.LastName}`,
        email: account.Email,
        phone: account.Phone,
        skills: account.Skills,
        status: account.AvailabilityStatus
      }
    });
  } catch (error) {
    console.error('Volunteer login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get volunteer account info
const getVolunteerAccount = async (req, res) => {
  const { username } = req.params;

  try {
    const [accounts] = await db.query(
      `SELECT va.*, v.FirstName, v.LastName, v.Email, v.Phone, v.Skills, 
              v.AvailabilityStatus
       FROM VolunteerAccounts va
       JOIN Volunteers v ON va.VolunteerID = v.VolunteerID
       WHERE va.Username = ? AND va.IsActive = TRUE`,
      [username]
    );

    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = accounts[0];
    res.json({
      accountId: account.AccountID,
      volunteerId: account.VolunteerID,
      username: account.Username,
      fullName: `${account.FirstName} ${account.LastName}`,
      email: account.Email,
      phone: account.Phone,
      skills: account.Skills,
      status: account.AvailabilityStatus,
      createdAt: account.CreatedAt,
      lastLogin: account.LastLogin
    });
  } catch (error) {
    console.error('Get volunteer account error:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
};

// Change volunteer password
const changePassword = async (req, res) => {
  const { username } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    // Verify old password
    const [accounts] = await db.query(
      'SELECT * FROM VolunteerAccounts WHERE Username = ? AND Password = ?',
      [username, oldPassword]
    );

    if (accounts.length === 0) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    // Update password
    await db.query(
      'UPDATE VolunteerAccounts SET Password = ? WHERE Username = ?',
      [newPassword, username]
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = {
  volunteerLogin,
  getVolunteerAccount,
  changePassword
};
