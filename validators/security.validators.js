const { body } = require('express-validator');

const securitySettingsValidator = [
  body('enforceMFA')
    .optional()
    .isBoolean()
    .withMessage('enforceMFA must be a boolean'),
  body('ipAllowlist')
    .optional()
    .isArray()
    .withMessage('IP allowlist must be an array'),
  body('ssoConfig.enabled')
    .optional()
    .isBoolean()
    .withMessage('SSO enabled must be a boolean'),
  body('ssoConfig.provider')
    .optional()
    .isIn(['google', 'microsoft', 'saml', 'oidc'])
    .withMessage('Invalid SSO provider'),
  body('passwordPolicy.minLength')
    .optional()
    .isInt({ min: 6, max: 20 })
    .withMessage('Password min length must be between 6 and 20'),
  body('passwordPolicy.requireUppercase')
    .optional()
    .isBoolean()
    .withMessage('requireUppercase must be a boolean'),
  body('passwordPolicy.requireLowercase')
    .optional()
    .isBoolean()
    .withMessage('requireLowercase must be a boolean'),
  body('passwordPolicy.requireNumbers')
    .optional()
    .isBoolean()
    .withMessage('requireNumbers must be a boolean'),
  body('passwordPolicy.requireSpecialChars')
    .optional()
    .isBoolean()
    .withMessage('requireSpecialChars must be a boolean'),
  body('passwordPolicy.expiryDays')
    .optional()
    .isInt({ min: 30, max: 365 })
    .withMessage('Password expiry must be between 30 and 365 days'),
  body('sessionSettings.timeout')
    .optional()
    .isInt({ min: 1, max: 720 })
    .withMessage('Session timeout must be between 1 and 720 hours'),
  body('sessionSettings.maxConcurrentSessions')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Max concurrent sessions must be between 1 and 10')
];

const ipAllowlistValidator = [
  body('ip')
    .notEmpty()
    .withMessage('IP address is required')
    .matches(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/)
    .withMessage('Invalid IP address format'),
  body('description')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Description must be less than 100 characters')
    .trim()
];

const toggleMFAValidator = [
  body('enforceMFA')
    .isBoolean()
    .withMessage('enforceMFA must be a boolean')
];

module.exports = {
  securitySettingsValidator,
  ipAllowlistValidator,
  toggleMFAValidator
};