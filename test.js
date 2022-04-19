const app = require('http').createServer((req, res) => res.send('sup!'));

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})

console.log(process.env);