import { HttpStatus, Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';

export class HttpBaseResponse<T> {
  @ApiProperty({
    enum: HttpStatus,
  })
  public code: HttpStatus;

  @ApiProperty()
  public data: T;

  @ApiProperty({ type: String })
  public message: string;

  constructor(
    code: number = HttpStatus.INTERNAL_SERVER_ERROR,
    data: T,
    message = '',
  ) {
    this.code = code;
    this.data = data;
    this.message = message;
  }
}

export class HttpSuccessResponse<T> extends HttpBaseResponse<T> {
  constructor(data: T, message = '') {
    super(HttpStatus.OK, data, message);
  }
}

export const ApiOkResponseCommon = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
  description?: string,
) =>
  applyDecorators(
    ApiExtraModels(HttpSuccessResponse, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(HttpSuccessResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(dataDto) },
            },
          },
        ],
      },
      description,
    }),
  );

export const ApiOkResponsePaginated = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
  description?: string,
) =>
  applyDecorators(
    ApiExtraModels(Pagination, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(HttpSuccessResponse) },
          {
            properties: {
              data: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(dataDto) },
                  },
                  meta: {
                    type: 'object',
                    properties: {
                      totalItems: { type: 'number' },
                      itemCount: { type: 'number' },
                      itemsPerPage: { type: 'number' },
                      totalPages: { type: 'number' },
                      currentPage: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        ],
      },
      description,
    }),
  );
