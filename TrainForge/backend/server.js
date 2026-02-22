const app = require('./app');

const port = Number(process.env.PORT || 8085);
app.listen(port, () => {
  console.log(`TrainForge API running on http://localhost:${port}`);
});
