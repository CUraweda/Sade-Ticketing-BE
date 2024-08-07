import http from "http";
import { env } from "process";
import app from "./app.js";

// var key = fs.readFileSync("./certs/sade.key");
// var cert = fs.readFileSync("./certs/sade.crt");
// var options = {
//   key: key,
//   cert: cert,
// };

const server = http.createServer(app);
// const server = https.createServer(app, options);

server.listen(env.PORT, () => {
  console.log(`Listening to port ${env.PORT}`);
});
