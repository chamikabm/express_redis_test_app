const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
  return new User({}).save(); // As we are not using any of the data expect the _id, will not hydrate the model.
};