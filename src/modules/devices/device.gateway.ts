import { Inject, forwardRef } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as tf from '@tensorflow/tfjs-node';
import * as faceApi from '@vladmandic/face-api';
import * as fs from 'fs';
import { Server, Socket } from 'socket.io';

import { EstateService } from '../estates/estate.service';

type TFace = faceApi.WithFaceDescriptor<
  faceApi.WithFaceLandmarks<
    {
      detection: faceApi.FaceDetection;
    },
    faceApi.FaceLandmarks68
  >
>;

@WebSocketGateway({
  cors: true,
  maxHttpBufferSize: 1e7,
})
export class DeviceGateway {
  @WebSocketServer()
  server: Server;

  private static modelsLoaded = false;
  private knownPeopleCached: Map<
    number,
    { personName: string; descriptor: TFace }[]
  > = new Map();

  constructor(
    @Inject(forwardRef(() => EstateService))
    private readonly estateService: EstateService,
  ) {
    this.loadModels();
  }

  private async loadModels() {
    const modelPath = `${process.cwd()}/uploads/models`;

    if (!DeviceGateway.modelsLoaded) {
      try {
        await faceApi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        await faceApi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceApi.nets.faceRecognitionNet.loadFromDisk(modelPath);

        DeviceGateway.modelsLoaded = true; // Set the flag
        console.log('FaceAPI models loaded successfully');
      } catch (error) {
        console.error('Error loading FaceAPI models:', error);
      }
    } else {
      console.log('FaceAPI models already loaded');
    }
  }

  private async loadKnownPeople(estateId: number) {
    const currentFolder = `${process.cwd()}/uploads/estates`;
    const uploadsFolder = `${currentFolder}/${estateId}/known_people`;

    const knownPeople = fs.readdirSync(uploadsFolder);

    const result: {
      personName: string;
      descriptor: TFace;
    }[] = [];

    for (const person of knownPeople) {
      const personFile = `${uploadsFolder}/${person}`;

      const idCode = person.split('.')[0];

      const recognition = await this.estateService.findRecognizedFaceByCode(
        idCode,
        estateId,
      );

      const buffer = fs.readFileSync(personFile);

      const tensor = tf.node.decodeImage(buffer, 3);

      const face = await faceApi
        .detectSingleFace(tensor as any)
        .withFaceLandmarks()
        .withFaceDescriptor();

      result.push({
        personName: recognition?.name || 'Unknown',
        descriptor: face,
      });
    }

    return result;
  }

  private async faceDetection(base64: string) {
    const base64Data = base64.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    try {
      if (DeviceGateway.modelsLoaded) {
        const tensor = tf.node.decodeImage(buffer, 3);

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
      } else {
        return [];
      }
    } catch (error) {
      console.log(error);
      throw new Error('Face detection failed');
    }
  }

  private async faceRecognition(faces: TFace[], estateId: number) {
    const knownPeople = this.knownPeopleCached.get(estateId);

    const result = faces.map((face) => {
      const bestMatch = knownPeople.reduce(
        (best, current) => {
          const distance = faceApi.euclideanDistance(
            face.descriptor,
            current.descriptor.descriptor,
          );

          return distance < best.distance ? { ...current, distance } : best;
        },
        {
          personName: 'Unknown',
          descriptor: { descriptor: null },
          distance: 1,
        },
      );

      return {
        ...face,
        bestMatch,
      };
    });

    return result;
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('device/join-room')
  async handleWsJoinRoom(
    client: Socket,
    payload: { estateId: number; deviceId: number },
  ) {
    const { estateId, deviceId } = payload;
    try {
      // Check if known people are already cached
      const knownPeople = await this.loadKnownPeople(estateId);
      this.knownPeopleCached.set(estateId, knownPeople);

      client.join(`estate-${estateId}-device-${deviceId}-${client.id}`);
      console.log(
        `Client ${client.id} joined room estate-${estateId}-device-${deviceId}`,
      );

      client.emit('device/joined-room', {
        estateId,
        deviceId,
      });

      // Emit the list of known people to the client
      client.emit('device/known-people', this.knownPeopleCached.get(estateId));
    } catch (error) {
      console.error(
        `Failed to load known people for estate ${estateId}:`,
        error,
      );

      client.emit('device/error', {
        message: 'Failed to load known people',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('device/leave-room')
  handleWsLeaveRoom(
    client: Socket,
    payload: { estateId: number; deviceId: number },
  ) {
    client.leave(
      `estate-${payload.estateId}-device-${payload.deviceId}-${client.id}`,
    );
    console.log(
      `Client ${client.id} left room estate-${payload.estateId}-device-${payload.deviceId}`,
    );

    client.emit('device/left-room', {
      estateId: payload.estateId,
    });
  }

  @SubscribeMessage('device/send-base64')
  handleSendBase64(
    client: Socket,
    payload: {
      base64: string;
      estateId: number;
      deviceId: number;
    },
  ): void {
    const { base64, estateId, deviceId } = payload;
    const knownPeople = this.knownPeopleCached.get(estateId);

    if (!knownPeople) {
      console.log('Known people not loaded for this estate.');
      client.emit('device/error', {
        message: 'Known people not loaded for this estate.',
      });
      return;
    }

    this.faceDetection(base64)
      .then((faces) => {
        // this.server.emit('device/receive-faces', faces);
        this.faceRecognition(faces, estateId)
          .then((result) => {
            const room = `estate-${estateId}-device-${deviceId}-${client.id}`;
            this.server
              .to(room)
              .emit('device/receive-recognized-faces', result);
            // client.emit('device/receive-recognized-faces', result);
          })
          .catch((error) => {
            console.log('Face recognition failed:', error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
