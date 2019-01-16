var tailwindcss = require('tailwindcss');
module.exports = {
  plugins: [
    tailwindcss('./assets/css/tailwind.js'),
    require('autoprefixer')({
      browsers: ['>1%']
    }),
  ]
};
