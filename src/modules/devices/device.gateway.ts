import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { exec } from 'child_process';
import * as fs from 'fs';
import { Server, Socket } from 'socket.io';
import { EDeviceAlert } from 'src/common/common.enum';

@WebSocketGateway()
export class DeviceGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message/send')
  handleMessage(client: Socket, payload: any): void {
    console.log(payload);
    this.server.emit('message/receive', payload);
  }

  @SubscribeMessage('device/send-base64')
  handleSendBase64(client: Socket, base64: string): void {
    try {
      const currentFolder = process.cwd();
      const uploadsFolder = `${currentFolder}/../Project-DeepL/unknown`;
      const targetDir = `${currentFolder}/../Project-DeepL`;
      if (!fs.existsSync(uploadsFolder)) {
        fs.mkdirSync(uploadsFolder, { recursive: true });
      }
      const fileName = `${uploadsFolder}/${Date.now()}.png`;
      fs.writeFileSync(fileName, base64, 'base64');

      exec(
        `source ${targetDir}/.venv/bin/activate && face_recognition ./known_people/ ./unknown`,
        { cwd: targetDir },
        (error, stdout) => {
          if (error) {
            console.error(`exec error: ${error}`);
          } else {
            console.log(`stdout: ${stdout}`);

            /**
             * ./unknown/1733325666813.png,huyền
             * ./unknown/1733325666813.png,kien
             * ./unknown/1733236464441.png,kien
             */

            const outputLines = stdout.trim().split('\n');
            // outputLines.forEach((line) => {
            //   const result = line.split(',')?.[1];
            //   if (result === 'no_persons_found') {
            //     this.server.emit('device/alert', {
            //       type: EDeviceAlert.STRANGER,
            //       message: 'Warning of strangers',
            //     });
            //   } else {
            //     this.server.emit('device/alert', {
            //       type: EDeviceAlert.USER_FOUND,
            //       name: result,
            //       message: `Hello, ${result}`,
            //     });
            //   }
            // });
            const alerts = [];

            outputLines.forEach((line) => {
              const result = line.split(',')?.[1];

              if (result === 'no_persons_found') {
                alerts.push({
                  type: EDeviceAlert.STRANGER,
                  message: 'Warning of strangers',
                });
              } else {
                alerts.push({
                  type: EDeviceAlert.USER_FOUND,
                  name: result,
                  message: `Hello, ${result}`,
                });
              }
            });

            this.server.emit('device/alert', alerts);
          }

          // Remove the file after execution completes
          fs.unlink(fileName, (err) => {
            if (err) {
              console.error(`Failed to delete file: ${fileName}`, err);
            } else {
              console.log(`File deleted: ${fileName}`);
            }
          });
        },
      );
    } catch (error) {
      console.error('err', error);
    }
    // this.server.emit('device/receive-base64', base64);
  }
}
