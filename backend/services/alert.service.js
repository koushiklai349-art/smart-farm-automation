const Alert = require("../models/alert.model");

class AlertService {

  async createAlert(data) {
    return await Alert.create(data);
  }

  async resolveAlert(alertId) {
    return await Alert.findByIdAndUpdate(
      alertId,
      { resolved: true },
      { new: true }
    );
  }

  async getActiveAlerts() {
    return await Alert.find({ resolved: false }).sort({ createdAt: -1 });
  }
}

module.exports = new AlertService();