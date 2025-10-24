// Export all validators from a single file
const authValidators = require('./auth.validators');
const userValidators = require('./user.validators');
const machineValidators = require('./machine.validators');
const productValidators = require('./product.validators');
const refillValidators = require('./refill.validators');
const planogramValidators = require('./planogram.validators');
const maintenanceValidators = require('./maintenance.validators');
const financeValidators = require('./finance.validators');
const supportValidators = require('./support.validators');
const customerValidators = require('./customer.validators');
const auditValidators = require('./audit.validators');
const roleValidators = require('./role.validators');
const inventoryValidators = require('./inventory.validators');

// New validators
const departmentValidators = require('./department.validators');
const accessRequestValidators = require('./accessRequest.validators');
const securityValidators = require('./security.validators');
const partnerValidators = require('./partner.validators');
const invitationValidators = require('./invitation.validators');

const { handleValidationErrors } = require('./validationMiddleware');

module.exports = {
  ...authValidators,
  ...userValidators,
  ...machineValidators,
  ...productValidators,
  ...refillValidators,
  ...planogramValidators,
  ...maintenanceValidators,
  ...financeValidators,
  ...supportValidators,
  ...customerValidators,
  ...auditValidators,
  ...roleValidators,
  ...inventoryValidators,
  ...departmentValidators,
  ...accessRequestValidators,
  ...securityValidators,
  ...partnerValidators,
  ...invitationValidators,
  handleValidationErrors
};