import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as tf from '@tensorflow/tfjs-node';
import * as faceApi from '@vladmandic/face-api';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: true,
  maxHttpBufferSize: 1e7,
})
export class DeviceGateway {
  @WebSocketServer()
  server: Server;

  private async faceDetection(base64: string) {
    const modelPath = `${process.cwd()}/uploads/models`;

    const base64Data = base64.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    try {
      await faceApi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
      await faceApi.nets.faceLandmark68Net.loadFromDisk(modelPath);
      await faceApi.nets.faceRecognitionNet.loadFromDisk(modelPath);
      console.log('Model loaded successfully');
      const tensor = tf.node.decodeImage(buffer, 3);
      console.log('tensor', tensor);
      const faces = await faceApi
        .detectAllFaces(
          tensor as any,
          new faceApi.SsdMobilenetv1Options({
            minConfidence: 0.2,
            maxResults: 5,
          }),
        )
        .withFaceLandmarks()
        .withFaceDescriptors();

      return faces;
    } catch (error) {
      console.log(error);
      throw new Error('Face detection failed');
    }
  }

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
    this.faceDetection(base64)
      .then((faces) => {
        console.log('send faces to client');
        this.server.emit('device/receive-faces', faces);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
