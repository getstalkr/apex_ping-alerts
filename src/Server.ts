import { IncomingMessage, ServerResponse } from "http";
import micro, { json, send } from "micro";
import { PusherClient } from "./Services/Pusher";
import { Alert } from "./Models/Alert";

export class Server {

    public static readonly PORT = 3000;
    private pusherClient: PusherClient;
    private server: micro;

    constructor() {
      this.pusherClient = new PusherClient();
      this.server = micro(
        async (req, res) => {

          const { triggered_at, alert } = await json(req);

          const { value } = alert;

          const event = new Alert(
            Date.parse(triggered_at),
            value
          );

          this.pusherClient.publish(event)
            .then((details) => {
              send(res, 200, { received: details });
            })
            .catch((err) => {
              send(res, 500, { error: err });
            });
        },
      );
    }

    public listen(): void {
      this.server.listen(process.env.PORT || Server.PORT, () => console.log("Listening..."));
    }
}
