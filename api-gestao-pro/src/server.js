const app = require('./app');
const port = process.env.PORT || 4002;
app.listen(port, () => console.log(`API Gest?o Pro em http://localhost:${port}`));

