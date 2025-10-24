const SecuritySettings = require('../models/SecuritySettings');
const AuditLog = require('../models/AuditLog');

const getSecuritySettings = async (req, res) => {
  try {
    let settings = await SecuritySettings.getSettings();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new SecuritySettings({
        updatedBy: req.user.id
      });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching security settings',
      error: error.message
    });
  }
};

const updateSecuritySettings = async (req, res) => {
  try {
    const {
      enforceMFA,
      ipAllowlist,
      ssoConfig,
      passwordPolicy,
      sessionSettings
    } = req.body;

    let settings = await SecuritySettings.getSettings();
    
    if (!settings) {
      settings = new SecuritySettings({
        updatedBy: req.user.id
      });
    }

    const previousState = settings.toObject();

    // Update fields
    if (enforceMFA !== undefined) settings.enforceMFA = enforceMFA;
    if (ipAllowlist) settings.ipAllowlist = ipAllowlist;
    if (ssoConfig) settings.ssoConfig = { ...settings.ssoConfig, ...ssoConfig };
    if (passwordPolicy) settings.passwordPolicy = { ...settings.passwordPolicy, ...passwordPolicy };
    if (sessionSettings) settings.sessionSettings = { ...settings.sessionSettings, ...sessionSettings };
    
    settings.updatedBy = req.user.id;

    await settings.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'update_security_settings',
      resource: 'security',
      resourceId: settings._id,
      previousState,
      newState: settings
    });

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating security settings',
      error: error.message
    });
  }
};

const addIPToAllowlist = async (req, res) => {
  try {
    const { ip, description } = req.body;

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipRegex.test(ip)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IP address format'
      });
    }

    let settings = await SecuritySettings.getSettings();
    if (!settings) {
      settings = new SecuritySettings({
        updatedBy: req.user.id
      });
    }

    // Check if IP already exists
    const existingIP = settings.ipAllowlist.find(item => item.ip === ip);
    if (existingIP) {
      return res.status(400).json({
        success: false,
        message: 'IP address already in allowlist'
      });
    }

    settings.ipAllowlist.push({
      ip,
      description: description || `Added by ${req.user.name}`
    });

    settings.updatedBy = req.user.id;
    await settings.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'add_ip_allowlist',
      resource: 'security',
      resourceId: settings._id,
      newState: { ipAdded: ip }
    });

    res.json({
      success: true,
      message: 'IP added to allowlist successfully',
      data: settings.ipAllowlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding IP to allowlist',
      error: error.message
    });
  }
};

const toggleMFA = async (req, res) => {
  try {
    const { enforceMFA } = req.body;

    let settings = await SecuritySettings.getSettings();
    if (!settings) {
      settings = new SecuritySettings({
        updatedBy: req.user.id
      });
    }

    const previousMFA = settings.enforceMFA;
    settings.enforceMFA = enforceMFA;
    settings.updatedBy = req.user.id;

    await settings.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'toggle_mfa',
      resource: 'security',
      resourceId: settings._id,
      previousState: { enforceMFA: previousMFA },
      newState: { enforceMFA: settings.enforceMFA }
    });

    res.json({
      success: true,
      message: `MFA ${enforceMFA ? 'enabled' : 'disabled'} successfully`,
      data: { enforceMFA: settings.enforceMFA }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling MFA',
      error: error.message
    });
  }
};

module.exports = {
  getSecuritySettings,
  updateSecuritySettings,
  addIPToAllowlist,
  toggleMFA
};